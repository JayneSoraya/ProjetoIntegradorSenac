import { pool } from '../database';

export class SupermercadoService {
  // Salva um novo supermercado no banco
  async cadastrar(dados: any) {
    const { nome, url_logo, logradouro, numero, bairro, cidade, estado, cep, latitude, longitude } = dados;

    const query = `
      INSERT INTO supermercado (nome, url_logo, logradouro, numero, bairro, cidade, estado, cep, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const valores = [nome, url_logo, logradouro, numero, bairro, cidade, estado, cep, latitude, longitude];
    const resultado = await pool.query(query, valores);
    return resultado.rows[0];
  }

  // Lista todos os supermercados cadastrados
  async listarTodos() {
    const query = 'SELECT * FROM supermercado ORDER BY nome ASC;';
    const resultado = await pool.query(query);
    return resultado.rows;
  }
}