import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../database';
import { seedDemoAccounts } from './seedDemoAccounts';

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Seed de demonstração bloqueado em produção.');
  }

  const seedPath = path.resolve(process.cwd(), 'database', 'seeds', '001_demo.sql');
  const sql = await fs.readFile(seedPath, 'utf8');
  await pool.query(sql);
  await seedDemoAccounts();
  console.log('Dados de demonstração carregados. Credenciais não são exibidas.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
