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

export class SupermercadoRepository {

  static async cadastrar(
    dados: SupermercadoDTO,
    client?: PoolClient,
  ) {
    const db = client || pool;

    const resultado = await db.query(
      `
      INSERT INTO supermercado (
        nome,
        url_logo,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        latitude,
        longitude
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
      )
      RETURNING *
      `,
      [
        dados.nome,
        dados.url_logo,
        dados.logradouro,
        dados.numero,
        dados.bairro,
        dados.cidade,
        dados.estado,
        dados.cep,
        dados.latitude,
        dados.longitude,
      ],
    );

    return resultado.rows[0];
  }

  static async listarTodos(
    client?: PoolClient,
  ) {
    const db = client || pool;

    const resultado = await db.query(
      `
      SELECT *
      FROM supermercado
      ORDER BY nome ASC
      `,
    );

    return resultado.rows;
  }

  static async buscarPorConta(
    idConta: number,
  ) {
    const resultado = await pool.query(
      `
      SELECT
        id_supermercado,
        nome_fantasia,
        telefone,
        email,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        pais,
        latitude,
        longitude,
        logo_url,
        capa_url
      FROM supermercado
      WHERE id_conta = $1
      `,
      [idConta],
    );

    return resultado.rows[0] ?? null;
  }

  static async atualizar(
    idSupermercado: number,
    dados: any,
  ) {

    const resultado = await pool.query(
      `
      UPDATE supermercado
      SET
        nome_fantasia = $1,
        cnpj = $2,
        email = $3,
        telefone = $4,
        cep = $5,
        logradouro = $6,
        numero = $7,
        bairro = $8,
        cidade = $9,
        estado = $10,
        pais = $11
      WHERE id_supermercado = $12
      RETURNING *
      `,
      [
        dados.nome_fantasia,
        dados.cnpj,
        dados.email,
        dados.telefone,
        dados.cep,
        dados.logradouro,
        dados.numero,
        dados.bairro,
        dados.cidade,
        dados.estado,
        dados.pais,
        idSupermercado,
      ],
    );

    return resultado.rows[0] ?? null;
  }
}