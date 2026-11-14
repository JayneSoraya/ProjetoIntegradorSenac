import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

if (process.env.NODE_ENV !== 'test') {
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      logger.error(
        `❌ Erro ao conectar no banco de dados Neon: ${err.message}`
      );
    } else {
      logger.info(
        `✅ Conexão com o banco Neon estabelecida com sucesso em: ${res.rows[0].now}`
      );
    }
  });
}