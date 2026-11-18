import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';

export const cadastrarUsuario = async (req: Request, res: Response) => {
  const { email } = req.body;
  logger.info(`📝 Tentativa de cadastro: ${email}`);

  try {
    const resposta = await AuthService.cadastrarUsuario(req.body);
    logger.info(`✅ Usuário cadastrado: ${email}`);
    return res.status(201).json(resposta);
  } catch (erro: any) {
    if (erro.message === 'CAMPOS_OBRIGATORIOS') {
      logger.warn('⚠️ Cadastro com campos obrigatórios ausentes');
      return res.status(400).json({
        erro: 'Campos obrigatórios: nome, email e senha.',
      });
    }

    if (erro.message === 'EMAIL_DUPLICADO') {
      return res.status(409).json({
        erro: 'Este e-mail já está cadastrado.',
      });
    }

    logger.error(`❌ Erro no cadastro: ${erro.message}`);
    return res.status(500).json({
      erro: erro.message || 'Erro interno no cadastro.',
    });
  }
};

export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const resposta = await AuthService.loginUsuario(req.body);
    return res.status(200).json(resposta);
  } catch (erro: any) {
    if (erro.message === 'CREDENCIAIS_OBRIGATORIAS') {
      return res.status(400).json({
        erro: 'Email e senha são obrigatórios.',
      });
    }

    if (erro.message === 'USUARIO_NAO_ENCONTRADO') {
      return res.status(401).json({
        erro: 'Usuário não encontrado',
      });
    }

    if (erro.message === 'SENHA_INVALIDA') {
      return res.status(401).json({
        erro: 'Senha inválida',
      });
    }

    logger.error(`❌ ERRO LOGIN: ${erro.message}`);
    return res.status(500).json({
      erro: 'Erro interno no login',
    });
  }
};