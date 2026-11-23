import { Request, Response } from 'express';
import { normalizeCartItems, normalizeMarketIds } from '../domain/cart';
import { ComparisonService } from '../services/comparisonService';
import { logger } from '../lib/logger';

export class ComparacaoController {
  comparar = async (req: Request, res: Response): Promise<void> => {
    try {
      const items = normalizeCartItems(req.body?.itens);
      const marketIds = normalizeMarketIds(req.body?.supermercados);
      const save = req.body?.salvar === true;
      const strategy = typeof req.body?.estrategia === 'string' ? req.body.estrategia : undefined;

      const result = await ComparisonService.compare(items, marketIds, {
        save,
        userId: req.auth?.userId ?? undefined,
        strategy,
      });

      res.status(save ? 201 : 200).json(result);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'INVALID_ITEMS') {
        res.status(400).json({ erro: 'Carrinho inválido.' });
        return;
      }
      if (code === 'INVALID_MARKETS') {
        res.status(400).json({ erro: 'Seleção de supermercados inválida.' });
        return;
      }
      if (code === 'PRODUCT_NOT_FOUND') {
        res.status(400).json({ erro: 'O carrinho contém produto inexistente.' });
        return;
      }
      if (code === 'NO_MARKETS_AVAILABLE') {
        res.status(422).json({ erro: 'Nenhum supermercado aprovado está disponível para esta comparação.' });
        return;
      }
      if (code === 'NO_COMPLETE_MARKET') {
        res.status(409).json({ erro: 'Não existe supermercado com a cesta completa para salvar esta comparação.' });
        return;
      }
      if (code === 'USER_REQUIRED') {
        res.status(403).json({ erro: 'A comparação só pode ser salva por um usuário consumidor.' });
        return;
      }

      logger.error('comparison_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao comparar mercados.' });
    }
  };

  historico = async (req: Request, res: Response): Promise<void> => {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(403).json({ erro: 'Histórico disponível apenas para usuários.' });
      return;
    }
    const limit = Number(req.query.limit ?? 20);
    try {
      const history = await ComparisonService.history(userId, Number.isFinite(limit) ? limit : 20);
      res.status(200).json(history);
    } catch (error) {
      logger.error('comparison_history_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao consultar histórico.' });
    }
  };

  detalhe = async (req: Request, res: Response): Promise<void> => {
    const userId = req.auth?.userId;
    const comparisonId = Number(req.params.id);
    if (!userId) {
      res.status(403).json({ erro: 'Histórico disponível apenas para usuários.' });
      return;
    }
    if (!Number.isInteger(comparisonId) || comparisonId <= 0) {
      res.status(400).json({ erro: 'Comparação inválida.' });
      return;
    }
    try {
      const detail = await ComparisonService.detail(userId, comparisonId);
      if (!detail) {
        res.status(404).json({ erro: 'Comparação não encontrada.' });
        return;
      }
      res.status(200).json(detail);
    } catch (error) {
      logger.error('comparison_detail_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao consultar comparação.' });
    }
  };
}
