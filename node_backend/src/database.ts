import { Pool, types } from 'pg';
import { env } from './config/env';
import { logger } from './lib/logger';

// PostgreSQL int8/BIGINT é retornado como string pelo pg por padrão.
// Os IDs do EconoWay são BIGINT, mas no domínio atual ficam muito abaixo de
// Number.MAX_SAFE_INTEGER. Normalizar aqui evita JWTs e comparações de IDs com
// tipos inconsistentes entre queries.
types.setTypeParser(20, (value) => {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error('POSTGRES_BIGINT_OUT_OF_SAFE_RANGE');
  }
  return parsed;
});

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: env.databasePoolMax,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (error) => {
  logger.error('postgres_idle_client_error', error);
});

export async function checkDatabase(): Promise<void> {
  await pool.query('SELECT 1');
}
