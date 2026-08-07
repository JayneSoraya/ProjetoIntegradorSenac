import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao conectar no banco de dados Neon:', err.stack);
  } else {
    console.log('✅ Conexão com o banco Neon estabelecida com sucesso em:', res.rows[0].now);
  }
});