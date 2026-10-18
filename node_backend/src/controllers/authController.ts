import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuarioService';
import { logger } from '../utils/logger';
import * as jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('FATAL: JWT_SECRET não configurado.');
}

export const cadastrarUsuario = async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: nome, email e senha.',
    });
  }

  try {
    await UsuarioService.cadastrar({ nome, email, senha });

    return res.status(201).json({
      status: 'sucesso',
      mensagem: 'Usuário cadastrado com sucesso!',
    });

  } catch (erro: any) {
    logger.error('❌ ERRO CADASTRO:', { erro: erro.message });

    if (erro.message === 'Este e-mail já está cadastrado.') {
      return res.status(409).json({ erro: erro.message });
    }

    return res.status(500).json({
      erro: erro.message || 'Erro interno no cadastro',
    });
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
    const usuario = await UsuarioService.autenticar(email, senha);

    if (!usuario) {
      return res.status(401).json({
        erro: 'Usuário não encontrado ou senha inválida',
      });
    }

    const token = jwt.sign(
      {
        id_conta: usuario.id_conta,
        id_usuario: usuario.id_usuario,
        tipo_conta: usuario.tipo_conta,
      },
      jwtSecret,
      {
        expiresIn: '7d',
      }
    );

    return res.json({
      status: 'sucesso',
      usuario: {
        id_conta: usuario.id_conta,
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        tipo_conta: usuario.tipo_conta,
      },
      token,
    });

  } catch (erro: any) {
    logger.error('❌ ERRO LOGIN:', { erro: erro.message });

    if (erro.message === 'Senha inválida' || erro.message === 'Usuário não encontrado') {
      return res.status(401).json({ erro: erro.message });
    }

    return res.status(500).json({
      erro: 'Erro interno no login',
    });
  }
};