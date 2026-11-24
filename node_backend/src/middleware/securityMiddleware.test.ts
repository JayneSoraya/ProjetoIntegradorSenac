import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import type { Request, Response } from 'express';

process.env.JWT_SECRET ??= 'test-secret-with-at-least-32-characters';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/econoway';
process.env.CORS_ORIGINS = 'http://localhost:5173';

interface CamposRequisicao {
  method?: string;
  headers?: Record<string, string>;
}

function criarReq(campos: CamposRequisicao = {}): Request {
  const headers = Object.fromEntries(
    Object.entries(campos.headers ?? {}).map(([nome, valor]) => [nome.toLowerCase(), valor]),
  );
  return {
    method: campos.method ?? 'GET',
    headers,
    header(nome: string) {
      return headers[nome.toLowerCase()];
    },
  } as unknown as Request;
}

function criarRes() {
  const res = {
    statusCode: 200,
    corpo: undefined as unknown,
    status(codigo: number) {
      res.statusCode = codigo;
      return res;
    },
    json(corpo: unknown) {
      res.corpo = corpo;
      return res;
    },
  };
  return res;
}

function comoResponse(res: ReturnType<typeof criarRes>): Response {
  return res as unknown as Response;
}

// ---------------------------------------------------------------------------
// browserCsrfGuard
// ---------------------------------------------------------------------------

test('browserCsrfGuard libera métodos de leitura, mesmo com cookie de sessão', async () => {
  const { browserCsrfGuard } = await import('./securityMiddleware');
  const next = mock.fn();

  browserCsrfGuard(
    criarReq({ method: 'GET', headers: { cookie: 'econoway_session=abc' } }),
    comoResponse(criarRes()),
    next,
  );

  assert.equal(next.mock.callCount(), 1);
});

test('browserCsrfGuard bloqueia POST com cookie de sessão e sem Origin', async () => {
  const { browserCsrfGuard } = await import('./securityMiddleware');
  const next = mock.fn();
  const res = criarRes();

  browserCsrfGuard(
    criarReq({ method: 'POST', headers: { cookie: 'econoway_session=abc' } }),
    comoResponse(res),
    next,
  );

  assert.equal(next.mock.callCount(), 0);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.corpo, { erro: 'Origem da requisição não autorizada.' });
});

test('browserCsrfGuard bloqueia POST com Origin fora da lista permitida', async () => {
  const { browserCsrfGuard } = await import('./securityMiddleware');
  const next = mock.fn();
  const res = criarRes();

  browserCsrfGuard(
    criarReq({
      method: 'POST',
      headers: { cookie: 'econoway_session=abc', origin: 'https://site-malicioso.example' },
    }),
    comoResponse(res),
    next,
  );

  assert.equal(next.mock.callCount(), 0);
  assert.equal(res.statusCode, 403);
});

test('browserCsrfGuard libera POST com Origin permitido', async () => {
  const { browserCsrfGuard } = await import('./securityMiddleware');
  const next = mock.fn();

  browserCsrfGuard(
    criarReq({
      method: 'POST',
      headers: { cookie: 'econoway_session=abc', origin: 'http://localhost:5173' },
    }),
    comoResponse(criarRes()),
    next,
  );

  assert.equal(next.mock.callCount(), 1);
});
