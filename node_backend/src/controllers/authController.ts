import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../database';
import jwt from 'jsonwebtoken';


export const cadastrarUsuario = async (req: Request, res: Response) => {
  const { nome, email, senha, tipo_conta } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: nome, email e senha.',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const contaExistente = await client.query(
      'SELECT id_conta FROM conta WHERE email = $1',
      [email]
    );

    if (contaExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        erro: 'Este e-mail já está cadastrado.',
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const resultConta = await client.query(
      `INSERT INTO conta (tipo_conta, email, senha, nome)
       VALUES ('USER', $1, $2, $3)
       RETURNING id_conta`,
      [email, senhaCriptografada, nome]
    );

    const idConta = resultConta.rows[0].id_conta;

    await client.query(
      `INSERT INTO usuario (id_conta)
       VALUES ($1)`,
      [idConta]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'sucesso',
      mensagem: 'Usuário cadastrado com sucesso!',
    });

  } catch (erro: any) {
    await client.query('ROLLBACK');

    console.error('❌ ERRO CADASTRO:', erro);

    return res.status(500).json({
      erro: erro.message,
    });

  } finally {
    client.release();
  }
};

export const loginUsuario = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      erro: 'Email e senha são obrigatórios.',
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        c.*,u.id_usuario
      FROM conta c
      LEFT JOIN usuario u
      ON u.id_conta = c.id_conta
      WHERE c.email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        erro: 'Usuário não encontrado',
      });
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Senha inválida',
      });
    }


const token = jwt.sign(
  {
    id_conta: usuario.id_conta,
    id_usuario: usuario.id_usuario,
    tipo_conta:usuario.tipo_conta,
  },
  process.env.JWT_SECRET || 'dev_secret',
  {
    expiresIn: '7d',
  }
);


return res.json({
  status: 'sucesso',
  usuario: {
    id_conta: usuario.conta,
    id_usuario: usuario.id_usuario,
    nome:usuario.nome,
    email: usuario.email,
    tipo_conta: usuario.tipo_conta,
  },
  token,
});


  } catch (erro: any) {
    console.error('❌ ERRO LOGIN:', erro);

    return res.status(500).json({
      erro: 'Erro interno no login',
    });
  }
};