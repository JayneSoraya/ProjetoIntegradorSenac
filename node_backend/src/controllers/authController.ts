import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { env, isProduction } from '../config/env';
import { clearLoginPairFailures, recordLoginFailure } from '../middleware/securityMiddleware';
import { logger } from '../lib/logger';

export async function cadastrarUsuario(req: Request, res: Response) {
  const { nome, email, senha } = req.body ?? {};

  try {
    await AuthService.cadastrarUsuario({ nome, email, senha });
    return res.status(201).json({
      status: 'sucesso',
      mensagem: 'Usuário cadastrado com sucesso.',
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';

    if (code === 'EMAIL_EXISTS') {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }
    if (code === 'INVALID_NAME') {
      return res.status(400).json({ erro: 'Informe um nome válido.' });
    }
    if (code === 'INVALID_EMAIL') {
      return res.status(400).json({ erro: 'Informe um e-mail válido.' });
    }
    if (code === 'WEAK_PASSWORD') {
      return res.status(400).json({ erro: 'A senha deve ter entre 8 caracteres e 72 bytes em UTF-8.' });
    }

    logger.error('auth_registration_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro interno ao criar a conta.' });
  }
}

export async function loginUsuario(req: Request, res: Response) {
  const { email, senha } = req.body ?? {};

  try {
    const resultado = await AuthService.login(email, senha);
    clearLoginPairFailures(req);

    // O portal web usa cookie HttpOnly; o app Android continua consumindo o token Bearer.
    res.cookie('econoway_session', resultado.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api',
      maxAge: env.jwtExpiresInSeconds * 1000,
    });

    return res.status(200).json({ status: 'sucesso', ...resultado });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';

    if (code === 'INVALID_CREDENTIALS') {
      recordLoginFailure(req);
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }
    if (code === 'ACCOUNT_DISABLED') {
      return res.status(403).json({ erro: 'Conta indisponível.' });
    }

    logger.error('auth_login_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro interno no login.' });
  }
}

export async function minhaConta(req: Request, res: Response) {
  if (!req.auth) {
    return res.status(401).json({ erro: 'Autenticação obrigatória.' });
  }

  try {
    const usuario = await AuthService.buscarConta(req.auth.accountId);
    if (!usuario) {
      return res.status(404).json({ erro: 'Conta não encontrada.' });
    }
    return res.status(200).json({ usuario });
  } catch (error) {
    logger.error('auth_me_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao consultar conta.' });
  }
}

export async function recuperarSenha(_req: Request, res: Response) {
  return res.status(501).json({
    erro: 'Recuperação de senha ainda não está habilitada neste ambiente.',
  });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('econoway_session', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/api',
  });
  return res.status(204).send();
}
