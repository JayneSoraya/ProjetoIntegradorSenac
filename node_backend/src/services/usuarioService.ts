import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../database';

export interface CadastroUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  cep?: string | null;
  aceita_lgpd: boolean;
  tipo_conta: string;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

export class UsuarioService {
  /**
   * Realiza o cadastro de uma nova conta e do perfil de usuário associado
   * de forma atômica utilizando transação.
   */
  static async cadastrar(dados: CadastroUsuarioDTO) {
    const { nome, email, senha, cep = null, aceita_lgpd, tipo_conta } = dados;

    const sal = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, sal);

    const client = await pool.connect();
    let transacaoIniciada = false;

    try {
      await client.query('BEGIN');
      transacaoIniciada = true;

      // 1. Insere na tabela conta
      const queryConta = `
        INSERT INTO conta (tipo_conta, email, senha, nome, cep)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_conta;
      `;
      const resConta = await client.query(queryConta, [
        tipo_conta,
        email,
        senhaCriptografada,
        nome,
        cep,
      ]);
      const idConta = resConta.rows[0].id_conta;

      // 2. Insere na tabela usuario vinculada à conta
      const queryUsuario = `
        INSERT INTO usuario (id_conta, aceita_lgpd)
        VALUES ($1, $2)
        RETURNING id_usuario;
      `;
      const resUsuario = await client.query(queryUsuario, [
        idConta,
        aceita_lgpd,
      ]);

      await client.query('COMMIT');
      transacaoIniciada = false;

      return {
        id_conta: idConta,
        id_usuario: resUsuario.rows[0].id_usuario,
        nome,
        email,
      };
    } catch (error) {
      if (transacaoIniciada) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          // Falha silenciosa ou log de rollback
        }
      }
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Realiza a autenticação do utilizador e retorna os dados com o token JWT.
   */
  static async login(credenciais: LoginDTO) {
    const { email, senha } = credenciais;

    const query = `
      SELECT c.*, u.id_usuario 
      FROM conta c
      LEFT JOIN usuario u ON c.id_conta = u.id_conta
      WHERE c.email = $1;
    `;

    const resultado = await pool.query(query, [email]);

    if (resultado.rows.length === 0) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const conta = resultado.rows[0];

    const senhaValida = await bcrypt.compare(senha, conta.senha);
    if (!senhaValida) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const token = jwt.sign(
      {
        id_conta: conta.id_conta,
        id_usuario: conta.id_usuario,
        tipo_conta: conta.tipo_conta,
      },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '1d' }
    );

    return {
      usuario: {
        id_usuario: conta.id_usuario,
        nome: conta.nome,
        email: conta.email,
        tipo_conta: conta.tipo_conta,
      },
      token,
    };
  }
}