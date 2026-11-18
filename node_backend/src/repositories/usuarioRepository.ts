import type { PoolClient } from 'pg';
import { pool } from '../database';

export class UsuarioRepository {

  static async criarConta(
    client: PoolClient,
    dados: {
      tipo_conta: string;
      email: string;
      senha: string;
      nome: string;
      cep: string | null;
    },
  ) {

    return client.query(
      `
      INSERT INTO conta (
        tipo_conta,
        email,
        senha,
        nome,
        cep
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id_conta
      `,
      [
        dados.tipo_conta,
        dados.email,
        dados.senha,
        dados.nome,
        dados.cep,
      ],
    );
  }

  static async criarUsuario(
    client: PoolClient,
    idConta: number,
    aceitaLgpd: boolean,
  ) {

    return client.query(
      `
      INSERT INTO usuario (
        id_conta,
        aceita_lgpd
      )
      VALUES ($1,$2)
      RETURNING id_usuario
      `,
      [
        idConta,
        aceitaLgpd,
      ],
    );
  }

  static async buscarPorEmail(
    email: string,
  ) {

    return pool.query(
      `
      SELECT
        c.*,
        u.id_usuario
      FROM conta c
      LEFT JOIN usuario u
        ON c.id_conta = u.id_conta
      WHERE c.email = $1
      `,
      [email],
    );
  }
}