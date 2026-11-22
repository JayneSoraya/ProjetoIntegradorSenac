import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { StatusConta } from '../domain/statusConta';
import { StatusContaService } from '../services/statusContaService';
import { logger } from '../lib/logger';

function readCookie(header: string | undefined, name: string): string {
  if (!header) return '';
  for (const part of header.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (rawName === name) {
      try {
        return decodeURIComponent(rawValue.join('='));
      } catch {
        return '';
      }
    }
  }
  return '';
}

interface TokenPayload extends jwt.JwtPayload {
  id_conta?: number;
  id_usuario?: number | null;
  tipo_conta?: 'USUARIO' | 'SUPERMERCADO' | 'ADMIN';
}

export async function autenticar(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';
  const cookieToken = readCookie(req.headers.cookie, 'econoway_session');
  const token = bearerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    }) as TokenPayload;

    if (
      !Number.isInteger(payload.id_conta) ||
      !payload.tipo_conta ||
      !['USUARIO', 'SUPERMERCADO', 'ADMIN'].includes(payload.tipo_conta)
    ) {
      return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }

  let status: StatusConta | null;
  try {
    status = await StatusContaService.consultar(payload.id_conta!);
  } catch (error) {
    logger.error('account_status_check_failed', error, { requestId: req.requestId });
    return res.status(503).json({ erro: 'Não foi possível validar a sessão. Tente novamente.' });
  }

  if (!status || !status.ativa || status.perfil !== payload.tipo_conta) {
    return res.status(401).json({ erro: 'Sessão encerrada. Entre novamente.' });
  }

  req.auth = {
    accountId: payload.id_conta!,
    userId: Number.isInteger(payload.id_usuario) ? payload.id_usuario! : null,
    role: status.perfil,
  };

  return next();
}

export function autorizar(...roles: Array<'USUARIO' | 'SUPERMERCADO' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ erro: 'Autenticação obrigatória.' });
    }

    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ erro: 'Acesso não autorizado.' });
    }

    return next();
  };
}
