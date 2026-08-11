import { Request, Response } from 'express';
import { ProdutoService } from '../services/produto.service';
import { logger } from '../lib/logger';

export class ProdutoController {
  buscar = async (req: Request, res: Response) => {
    const busca = typeof req.query.busca === 'string' ? req.query.busca : '';
    const categoriaRaw = typeof req.query.categoria === 'string' ? req.query.categoria : '';
    const categoria = categoriaRaw === 'Todos' ? '' : categoriaRaw;

    if (busca.length > 120 || categoria.length > 80) {
      return res.status(400).json({ erro: 'Filtros de busca inválidos.' });
    }

    try {
      const produtos = await ProdutoService.buscar(busca, categoria);
      return res.status(200).json(produtos);
    } catch (error) {
      logger.error('product_search_failed', error, { requestId: req.requestId });
      return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
    }
  };

  buscarDetalhe = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'ID de produto inválido.' });
    }

    try {
      const produto = await ProdutoService.buscarDetalhe(id);
      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
      }
      return res.status(200).json(produto);
    } catch (error) {
      logger.error('product_detail_failed', error, { requestId: req.requestId });
      return res.status(500).json({ erro: 'Erro ao buscar produto.' });
    }
  };
}
