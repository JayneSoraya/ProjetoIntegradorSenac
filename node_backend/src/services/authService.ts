import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../database';
import { env } from '../config/env';

export type TipoConta = 'USUARIO' | 'SUPERMERCADO' | 'ADMIN';

export interface CadastroUsuarioInput {
  nome: string;
  email: string;
  senha: string;
}

export interface UsuarioAutenticado {
  id_conta: number;
  id_usuario: number | null;
  nome: string;
  email: string;
  tipo_conta: TipoConta;
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validarCadastro(input: CadastroUsuarioInput): void {
  if (!input.nome?.trim() || input.nome.trim().length < 2 || input.nome.trim().length > 120) {
    throw new Error('INVALID_NAME');
  }

  const email = normalizarEmail(input.email || '');
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('INVALID_EMAIL');
  }

  if (!input.senha || input.senha.length < 8 || Buffer.byteLength(input.senha, 'utf8') > 72) {
    throw new Error('WEAK_PASSWORD');
  }
}

export class AuthService {
  static async cadastrarUsuario(input: CadastroUsuarioInput): Promise<void> {
    validarCadastro(input);

    const nome = input.nome.trim();
    const email = normalizarEmail(input.email);
    const senhaHash = await bcrypt.hash(input.senha, 10);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const contaExistente = await client.query(
        'SELECT 1 FROM conta WHERE LOWER(email) = $1 LIMIT 1',
        [email],
      );

      if (contaExistente.rowCount) {
        throw new Error('EMAIL_EXISTS');
      }

      const conta = await client.query<{ id_conta: number }>(
        `INSERT INTO conta (tipo_conta, email, senha, nome)
         VALUES ('USUARIO', $1, $2, $3)
         RETURNING id_conta`,
        [email, senhaHash, nome],
      );

      await client.query(
        'INSERT INTO usuario (id_conta) VALUES ($1)',
        [conta.rows[0].id_conta],
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        throw new Error('EMAIL_EXISTS');
      }
      throw error;
    } finally {
      client.release();
    }
  }

  static async login(emailInput: string, senha: string): Promise<{
    usuario: UsuarioAutenticado;
    token: string;
  }> {
    const email = normalizarEmail(emailInput || '');

    if (!email || !senha) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const result = await pool.query<{
      id_conta: number;
      id_usuario: number | null;
      nome: string;
      email: string;
      senha: string;
      tipo_conta: TipoConta;
      status_conta: boolean | null;
    }>(
      `SELECT
         c.id_conta,
         u.id_usuario,
         c.nome,
         c.email,
         c.senha,
         c.tipo_conta,
         c.status_conta
       FROM conta c
       LEFT JOIN usuario u ON u.id_conta = c.id_conta
       WHERE LOWER(c.email) = $1
       LIMIT 1`,
      [email],
    );

    const conta = result.rows[0];
    if (!conta || !(await bcrypt.compare(senha, conta.senha))) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (conta.status_conta === false) {
      throw new Error('ACCOUNT_DISABLED');
    }

    await pool.query('UPDATE conta SET ultimo_login = NOW() WHERE id_conta = $1', [conta.id_conta]);

    const usuario: UsuarioAutenticado = {
      id_conta: conta.id_conta,
      id_usuario: conta.id_usuario,
      nome: conta.nome,
      email: conta.email,
      tipo_conta: conta.tipo_conta,
    };

    const token = jwt.sign(
      {
        id_conta: usuario.id_conta,
        id_usuario: usuario.id_usuario,
        tipo_conta: usuario.tipo_conta,
      },
      env.jwtSecret,
      {
        subject: String(usuario.id_conta),
        issuer: env.jwtIssuer,
        audience: env.jwtAudience,
        expiresIn: env.jwtExpiresInSeconds,
        algorithm: 'HS256',
      },
    );

    return { usuario, token };
  }
  static async buscarConta(accountId: number): Promise<UsuarioAutenticado | null> {
    const result = await pool.query<{
      id_conta: number;
      id_usuario: number | null;
      nome: string;
      email: string;
      tipo_conta: TipoConta;
    }>(
      `SELECT c.id_conta, u.id_usuario, c.nome, c.email, c.tipo_conta
       FROM conta c
       LEFT JOIN usuario u ON u.id_conta = c.id_conta
       WHERE c.id_conta = $1 AND c.status_conta = TRUE
       LIMIT 1`,
      [accountId],
    );

    return result.rows[0] ?? null;
  }

}
