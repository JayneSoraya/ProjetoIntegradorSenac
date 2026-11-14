import { Request, Response } from 'express';
import { ProdutoService } from '../services/produtoService';
import { logger } from '../utils/logger';

export class ProdutoController {
  // RF05 — Busca por nome/marca e categoria com paginação
  static async buscar(req: Request, res: Response): Promise<Response> {
    try {
      const { busca, categoria, page = '1', limit = '50' } = req.query;

      // Tratamento seguro para garantir que query params sejam tratados como string ou undefined
      const buscaStr = typeof busca === 'string' ? busca : undefined;
      const categoriaStr = typeof categoria === 'string' ? categoria : undefined;

      const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNumber = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 50));

      const produtos = await ProdutoService.buscarComFiltros({
        busca: buscaStr,
        categoria: categoriaStr,
        page: pageNumber,
        limit: limitNumber,
      });

      return res.status(200).json(produtos);
    } catch (erro) {
      logger.error('❌ Erro ao buscar produtos:', erro);
      return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
    }
  }

  // RF07 — Detalhe do produto por ID
  static async buscarDetalhe(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      // Garante que pegamos a string mesmo se o Express tipar como array
      const idStr = Array.isArray(id) ? id[0] : id;
      const idNumerico = parseInt(idStr, 10);

      if (!idStr || isNaN(idNumerico)) {
        return res.status(400).json({ erro: 'ID de produto inválido.' });
      }

      const produto = await ProdutoService.buscarDetalheCompleto(idNumerico);

      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
      }

      return res.status(200).json(produto);

    } catch (erro) {
      logger.error('❌ Erro ao buscar detalhe:', erro);
      return res.status(500).json({ erro: 'Erro ao buscar produto.' });
    }
  }
}