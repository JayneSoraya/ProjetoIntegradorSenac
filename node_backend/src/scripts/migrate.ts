import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error('DATABASE_URL e obrigatoria para executar migrations.');
}

const pool = new Pool({ connectionString: databaseUrl });

function checksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function main() {
  const migrationsDir = path.resolve(process.cwd(), 'database', 'migrations');
  const files = (await fs.readdir(migrationsDir))
    .filter((name) => name.endsWith('.sql'))
    .sort();

  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migration (
        nome VARCHAR(255) PRIMARY KEY,
        checksum_sha256 VARCHAR(64) NOT NULL,
        aplicada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query('SELECT pg_advisory_lock($1)', [20260810]);

    for (const file of files) {
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      const hash = checksum(sql);
      const existing = await client.query<{ checksum_sha256: string }>(
        'SELECT checksum_sha256 FROM schema_migration WHERE nome = $1',
        [file],
      );

      if (existing.rows[0]) {
        if (existing.rows[0].checksum_sha256 !== hash) {
          throw new Error(`Migration ja aplicada foi alterada: ${file}`);
        }
        console.log(`skip ${file}`);
        continue;
      }

      console.log(`apply ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migration (nome, checksum_sha256) VALUES ($1, $2)',
          [file, hash],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [20260810]);
    } catch {
      // A conexao sera encerrada de qualquer forma.
    }
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
