import { pool } from '../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export class UsuarioService {

  static async cadastrar(dados: any) {
    const { nome, email, senha, cep, aceita_lgpd, tipo_conta } = dados;

    const sal = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, sal);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const queryConta = `
        INSERT INTO conta (tipo_conta, email, senha, nome, cep)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_conta;
      `;
      const resConta = await client.query(queryConta, [tipo_conta || 'USER', email, senhaCriptografada, nome, cep]);
      const idConta = resConta.rows[0].id_conta;

      const queryUsuario = `
        INSERT INTO usuario (id_conta, aceita_lgpd)
        VALUES ($1, $2)
        RETURNING id_usuario;
      `;
      const resUsuario = await client.query(queryUsuario, [idConta, aceita_lgpd]);

      await client.query('COMMIT');

      return {
        id_conta: idConta,
        id_usuario: resUsuario.rows[0].id_usuario,
        nome,
        email
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async autenticar(email: string, senhaPlana: string) {
    const query = `
      SELECT c.*, u.id_usuario 
      FROM conta c
      LEFT JOIN usuario u ON c.id_conta = u.id_conta
      WHERE c.email = $1;
    `;
    
    const resultado = await pool.query(query, [email]);

    if (resultado.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    const conta = resultado.rows[0];

    const senhaValida = await bcrypt.compare(senhaPlana, conta.senha);
    if (!senhaValida) {
      throw new Error('Senha inválida');
    }

    logger.info('👤 Usuário autenticado com sucesso:', { email: conta.email });
    
    return {
      id_conta: conta.id_conta,
      id_usuario: conta.id_usuario,
      nome: conta.nome,    
      email: conta.email,
      tipo_conta: conta.tipo_conta
    };
  }

  // Métodos exigidos pelo painel administrativo
  static async listarUsuarios(busca?: string) {
    let sql = `
      SELECT c.id_conta, c.nome, c.email, c.status_conta, c.data_cadastro, u.id_usuario
      FROM conta c
      INNER JOIN usuario u ON u.id_conta = c.id_conta
      WHERE c.tipo_conta = 'USER'
    `;
    const params: string[] = [];

    if (busca) {
      sql += ` AND (LOWER(c.nome) LIKE LOWER($1) OR LOWER(c.email) LIKE LOWER($1))`;
      params.push(`%${busca}%`);
    }

    sql += ` ORDER BY c.nome ASC`;

    const resultado = await pool.query(sql, params);
    return resultado.rows;
  }

  static async bloquearUsuario(idConta: string, bloquear: boolean) {
    const statusAtivo = !bloquear;
    const resultado = await pool.query(
      `UPDATE conta SET status_conta = $1 WHERE id_conta = $2 RETURNING *`,
      [statusAtivo, idConta]
    );
    return resultado.rows[0];
  }
}