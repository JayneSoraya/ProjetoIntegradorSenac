import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { logger } from '../lib/logger';

function authUser(req: Request) {
  if (!req.auth?.userId || req.auth.role !== 'USUARIO') throw new Error('AUTH_REQUIRED');
  return { accountId: req.auth.accountId, userId: req.auth.userId };
}

export async function meuPerfil(req: Request, res: Response) {
  try {
    const auth = authUser(req);
    const profile = await UserService.profile(auth.accountId, auth.userId);
    if (!profile) return res.status(404).json({ erro: 'Perfil não encontrado.' });
    return res.status(200).json(profile);
  } catch (error) {
    logger.error('user_profile_get_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao consultar perfil.' });
  }
}

export async function atualizarMeuPerfil(req: Request, res: Response) {
  try {
    const auth = authUser(req);
    const profile = await UserService.updateProfile({
      ...auth,
      cep: req.body?.cep,
      endereco: req.body?.endereco,
      latitude: req.body?.latitude,
      longitude: req.body?.longitude,
      tipoVeiculo: req.body?.tipo_veiculo,
    });
    return res.status(200).json(profile);
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (['INVALID_CEP', 'INVALID_COORDINATES'].includes(code)) {
      return res.status(400).json({ erro: 'Dados de perfil inválidos.' });
    }
    logger.error('user_profile_update_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
  }
}

export async function exportarMeusDados(req: Request, res: Response) {
  try {
    const auth = authUser(req);
    const data = await UserService.exportPersonalData(auth.accountId, auth.userId);
    res.setHeader('Content-Disposition', 'attachment; filename="econoway-meus-dados.json"');
    return res.status(200).json(data);
  } catch (error) {
    logger.error('user_export_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao exportar dados pessoais.' });
  }
}

export async function excluirMinhaConta(req: Request, res: Response) {
  try {
    const auth = authUser(req);
    await UserService.deleteAccount(auth.accountId, auth.userId, String(req.body?.senha ?? ''));
    res.clearCookie('econoway_session', { path: '/api' });
    return res.status(204).send();
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'PASSWORD_REQUIRED') return res.status(400).json({ erro: 'Confirme sua senha para excluir a conta.' });
    if (code === 'INVALID_CREDENTIALS') return res.status(401).json({ erro: 'Senha inválida.' });
    logger.error('user_delete_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao excluir conta.' });
  }
}
