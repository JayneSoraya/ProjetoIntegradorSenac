import { Request, Response } from 'express';
import { logger } from '../lib/logger';
import { EconomyService } from '../services/economyService';

export const buscarResumo = async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(403).json({ erro: 'Resumo disponível apenas para usuários.' });
  }

  try {
    return res.status(200).json(await EconomyService.buscarResumo(userId));
  } catch (error) {
    logger.error('economy_summary_failed', error, { requestId: req.requestId, userId });
    return res.status(500).json({ erro: 'Erro ao buscar dados.' });
  }
};
