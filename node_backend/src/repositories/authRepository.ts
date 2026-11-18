import { pool } from '../database';

export class AuthRepository {
  static async buscarContaPorEmail(email: string) {
    return pool.query(
      'SELECT id_conta FROM conta WHERE email = $1',
      [email]
    );
  }

  static async criarUsuarioComTransacao(dados: {
    email: string;
    senhaCriptografada: string;
    nome: string;
  }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const contaExistente = await client.query(
        'SELECT id_conta FROM conta WHERE email = $1',
        [dados.email]
      );

      if (contaExistente.rows.length > 0) {
        await client.query('ROLLBACK');
        throw new Error('EMAIL_DUPLICADO');
      }

      const resultConta = await client.query(
        `INSERT INTO conta (tipo_conta, email, senha, nome)
         VALUES ('USER', $1, $2, $3)
         RETURNING id_conta`,
        [dados.email, dados.senhaCriptografada, dados.nome]
      );

      const idConta = resultConta.rows[0].id_conta;

      await client.query(
        `INSERT INTO usuario (id_conta)
         VALUES ($1)`,
        [idConta]
      );

      await client.query('COMMIT');
      return idConta;
    } catch (erro) {
      await client.query('ROLLBACK');
      throw erro;
    } finally {
      client.release();
    }
  }

  static async buscarDadosLoginPorEmail(email: string) {
    return pool.query(
      `
      SELECT
        c.*, u.id_usuario
      FROM conta c
      LEFT JOIN usuario u ON u.id_conta = c.id_conta
      WHERE c.email = $1
      `,
      [email]
    );
  }
}