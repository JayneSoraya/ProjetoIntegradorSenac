import { Request, Response } from 'express';
import { ProgressoService } from '../services/progressoService';
import { logger } from '../utils/logger';

// GET /api/progresso
export const buscarProgresso = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  const { id_usuario } = req.usuario;

  try {
    const dadosProgresso = await ProgressoService.buscarProgressoZeigarnik(id_usuario);
    return res.status(200).json(dadosProgresso);
  } catch (erro: any) {
    logger.error('❌ Erro ao buscar progresso:', { erro: erro.message });
    return res.status(500).json({ erro: 'Erro ao buscar progresso.' });
  }
};