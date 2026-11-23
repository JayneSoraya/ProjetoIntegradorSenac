import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { env, isProduction } from '../config/env';
import { logger } from '../lib/logger';

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-request-id')?.trim();
  const requestId = incoming && incoming.length <= 128 ? incoming : randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

export function requestAccessLog(req: Request, res: Response, next: NextFunction) {
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.info('http_request', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      accountId: req.auth?.accountId ?? null,
      role: req.auth?.role ?? null,
    });
  });
  next();
}

export function baselineSecurityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Origin, Sec-Fetch-Site');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

interface RateBucket {
  count: number;
  resetAt: number;
}

// Limite em memória adequado apenas à execução single-instance do alpha.
// Em produção horizontal, mover para gateway/Redis/serviço compartilhado.
const loginPairBuckets = new Map<string, RateBucket>();
const loginIpBuckets = new Map<string, RateBucket>();
const LOGIN_PAIR_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_PAIR_MAX_FAILURES = 10;
const LOGIN_IP_WINDOW_MS = 24 * 60 * 60 * 1000;
const LOGIN_IP_MAX_FAILURES = 100;

function loginKeys(req: Request) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '-';
  const ip = req.ip || req.socket.remoteAddress || '-';
  return { pair: `${ip}|${email}`, ip };
}

function activeBucket(map: Map<string, RateBucket>, key: string, now: number): RateBucket | null {
  const bucket = map.get(key);
  if (!bucket) return null;
  if (bucket.resetAt <= now) {
    map.delete(key);
    return null;
  }
  return bucket;
}

export function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const keys = loginKeys(req);
  const pair = activeBucket(loginPairBuckets, keys.pair, now);
  const ip = activeBucket(loginIpBuckets, keys.ip, now);

  const blockedPair = pair && pair.count >= LOGIN_PAIR_MAX_FAILURES;
  const blockedIp = ip && ip.count >= LOGIN_IP_MAX_FAILURES;
  if (blockedPair || blockedIp) {
    const resetAt = Math.max(blockedPair ? pair!.resetAt : 0, blockedIp ? ip!.resetAt : 0);
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((resetAt - now) / 1000))));
    res.status(429).json({ erro: 'Muitas tentativas de autenticação. Tente novamente mais tarde.' });
    return;
  }

  next();
}

function incrementFailure(map: Map<string, RateBucket>, key: string, windowMs: number) {
  const now = Date.now();
  const current = activeBucket(map, key, now);
  if (!current) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  current.count += 1;
}

export function recordLoginFailure(req: Request) {
  const keys = loginKeys(req);
  incrementFailure(loginPairBuckets, keys.pair, LOGIN_PAIR_WINDOW_MS);
  incrementFailure(loginIpBuckets, keys.ip, LOGIN_IP_WINDOW_MS);
}

export function clearLoginPairFailures(req: Request) {
  loginPairBuckets.delete(loginKeys(req).pair);
}

export function fixedWindowRateLimit(options: {
  windowMs: number;
  max: number;
  scope: 'ip' | 'account';
  message?: string;
}) {
  const buckets = new Map<string, RateBucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const identity = options.scope === 'account' && req.auth?.accountId
      ? `account:${req.auth.accountId}`
      : `ip:${req.ip || req.socket.remoteAddress || '-'}`;
    let bucket = activeBucket(buckets, identity, now);
    if (!bucket) {
      bucket = { count: 0, resetAt: now + options.windowMs };
      buckets.set(identity, bucket);
    }

    if (bucket.count >= options.max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      res.status(429).json({ erro: options.message ?? 'Limite temporário de requisições excedido.' });
      return;
    }

    bucket.count += 1;
    // Limpeza oportunista para evitar crescimento ilimitado no alpha single-instance.
    if (buckets.size > 10_000) {
      for (const [key, value] of buckets) if (value.resetAt <= now) buckets.delete(key);
    }
    next();
  };
}

function hasSessionCookie(header: string | undefined): boolean {
  return Boolean(header?.split(';').some((part) => part.trim().startsWith('econoway_session=')));
}

/**
 * Defesa complementar contra CSRF para o portal web autenticado por cookie.
 * Apps Android usam Bearer e não dependem de Origin.
 */
export function browserCsrfGuard(req: Request, res: Response, next: NextFunction) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    next();
    return;
  }

  const bearer = req.headers.authorization?.startsWith('Bearer ') === true;
  if (bearer || !hasSessionCookie(req.headers.cookie)) {
    next();
    return;
  }

  const origin = req.header('origin')?.trim().toLowerCase();
  if (!origin || !env.corsOrigins.includes(origin)) {
    res.status(403).json({ erro: 'Origem da requisição não autorizada.' });
    return;
  }

  next();
}
