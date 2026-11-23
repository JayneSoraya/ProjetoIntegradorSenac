import { Request, Response } from 'express';
import { logger } from '../lib/logger';
import { ProgressoService } from '../services/progressoService';

export async function buscarProgresso(req: Request, res: Response) {
  const userId = req.auth?.userId;
  if (!userId) return res.status(403).json({ erro: 'Progresso disponível apenas para usuários.' });

  try {
    return res.status(200).json(await ProgressoService.buscarProgresso(userId));
  } catch (error) {
    logger.error('progresso_failed', error, { requestId: req.requestId, userId });
    return res.status(500).json({ erro: 'Erro ao buscar progresso.' });
  }
}
