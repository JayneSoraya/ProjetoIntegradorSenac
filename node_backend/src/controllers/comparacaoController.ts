import { Request, Response } from 'express';
import { ComparacaoService } from '../services/comparacaoService';
import { logger } from '../utils/logger';

export class ComparacaoController {
  comparar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { itens } = req.body;

      if (!itens || itens.length === 0) {
        res.status(400).json({
          erro: 'Carrinho vazio.',
        });
        return;
      }

      const dadosComparacao = await ComparacaoService.comparar(itens);

      logger.info('Comparação de preços realizada com sucesso.', {
        totalMercadosAvaliados: dadosComparacao.totalMercadosAvaliados,
        totalItensCarrinho: dadosComparacao.totalItensCarrinho,
      });

      res.status(200).json(dadosComparacao.resultado);
    } catch (erro) {
      logger.error('Erro crítico ao processar comparação de mercados.', {
        error: erro instanceof Error ? erro.message : String(erro),
        stack: erro instanceof Error ? erro.stack : undefined,
      });

      res.status(500).json({
        erro: 'Erro ao comparar mercados.',
      });
    }
  };
}