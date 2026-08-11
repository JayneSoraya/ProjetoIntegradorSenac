import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

function integer(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Variável de ambiente inválida: ${name}`);
  }
  return value;
}

function nonNegativeInteger(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Variável de ambiente inválida: ${name}`);
  }
  return value;
}

function csv(name: string, fallback: string[] = []): string[] {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  return raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET deve possuir pelo menos 32 caracteres.');
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  port: integer('PORT', 3333),
  databaseUrl: required('DATABASE_URL'),
  databasePoolMax: integer('DATABASE_POOL_MAX', 10),
  trustProxyHops: nonNegativeInteger('TRUST_PROXY_HOPS', 0),
  jwtSecret,
  jwtIssuer: process.env.JWT_ISSUER?.trim() || 'econoway-api',
  jwtAudience: process.env.JWT_AUDIENCE?.trim() || 'econoway-clients',
  jwtExpiresInSeconds: integer('JWT_EXPIRES_IN_SECONDS', 60 * 60 * 24 * 7),
  priceFreshnessHours: integer('PRICE_FRESHNESS_HOURS', 24 * 7),
  corsOrigins: csv('CORS_ORIGINS', [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]),
  nfceAllowedHosts: csv('NFCE_ALLOWED_HOSTS', [
    'www.nfce.fazenda.sp.gov.br',
    'www.homologacao.nfce.fazenda.sp.gov.br',
  ]),
});

export const isProduction = env.nodeEnv === 'production';
