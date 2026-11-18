import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuarioService';
import { logger } from '../utils/logger';

export const cadastrarUsuario = async (
  req: Request,
  res: Response,
): Promise<void> => {

  try {

    const resultado =
      await UsuarioService.cadastrar(
        req.body,
      );

    res.status(201).json({
      mensagem:
        'Usuário registrado com sucesso! 🚀',
      dados: resultado,
    });

  } catch (error: any) {

    logger.error(
      `Erro ao cadastrar usuário: ${
        error?.message ?? String(error)
      }`,
    );

    if (error.code === '23505') {

      res.status(400).json({
        erro:
          'Este e-mail já está cadastrado no sistema.',
      });

      return;
    }

    res.status(500).json({
      erro:
        'Erro interno ao processar o cadastro.',
    });
  }
};

export const loginUsuario = async (
  req: Request,
  res: Response,
): Promise<void> => {

  try {

    const resultado =
      await UsuarioService.login(
        req.body,
      );

    res.status(200).json({
      mensagem:
        'Login realizado com sucesso!',
      ...resultado,
    });

  } catch (error: any) {

    logger.warn(
      `Falha no login: ${
        error?.message ?? String(error)
      }`,
    );

    res.status(401).json({
      erro:
        error?.message ??
        'E-mail ou senha incorretos.',
    });
  }
};