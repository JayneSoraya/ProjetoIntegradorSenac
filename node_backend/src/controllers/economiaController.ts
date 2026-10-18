import { Request, Response } from 'express';
import { EconomiaService } from '../services/economiaService';
import { logger } from '../utils/logger';

export const buscarResumo = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
    const resumo = await EconomiaService.obterResumoUsuario(idUsuario);

    return res.status(200).json(resumo);
  } catch (erro: any) {
    logger.error('❌ Erro ao buscar resumo:', { erro: erro.message });
    return res.status(500).json({ erro: 'Erro ao buscar dados.' });
  }
};

export const obterEconomia = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
    const economia = await EconomiaService.calcularEconomia(idUsuario);

    return res.status(200).json(economia);
  } catch (erro: any) {
    logger.error('❌ Erro ao calcular economia:', { erro: erro.message });
    return res.status(500).json({ erro: 'Erro ao calcular economia.' });
  }
};