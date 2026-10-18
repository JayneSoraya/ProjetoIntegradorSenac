import { Request, Response } from 'express';
import { ComparacaoService } from '../services/comparacaoService';
import { logger } from '../utils/logger';

export class ComparacaoController {
  comparar = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { itens } = req.body;

      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        res.status(400).json({
          erro: 'Carrinho vazio.',
        });
        return;
      }

      const resultado = await ComparacaoService.compararCarrinho(itens);

      res.status(200).json(resultado);

    } catch (erro: any) {
      logger.error('❌ Erro ao comparar mercados:', { erro: erro.message });

      res.status(500).json({
        erro: 'Erro ao comparar mercados.',
      });
    }
  };
}