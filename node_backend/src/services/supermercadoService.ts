import type { PoolClient } from 'pg';
import { pool } from '../database';

export interface SupermercadoDTO {
  nome: string;
  url_logo?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export class SupermercadoService {
  /**
   * Salva um novo supermercado no banco.
   * Aceita opcionalmente um PoolClient para participar de transações atômicas.
   */
  static async cadastrar(dados: SupermercadoDTO, client?: PoolClient) {
    const db = client || pool;

    const {
      nome,
      url_logo = null,
      logradouro = null,
      numero = null,
      bairro = null,
      cidade = null,
      estado = null,
      cep = null,
      latitude = null,
      longitude = null,
    } = dados;

    const query = `
      INSERT INTO supermercado (
        nome, url_logo, logradouro, numero, bairro, cidade, estado, cep, latitude, longitude
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const valores = [
      nome,
      url_logo,
      logradouro,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      latitude,
      longitude,
    ];

    const resultado = await db.query(query, valores);
    return resultado.rows[0];
  }

  /**
   * Lista todos os supermercados cadastrados ordenados alfabeticamente por nome.
   */
  static async listarTodos(client?: PoolClient) {
    const db = client || pool;
    const query = 'SELECT * FROM supermercado ORDER BY nome ASC;';
    const resultado = await db.query(query);
    return resultado.rows;
  }
}