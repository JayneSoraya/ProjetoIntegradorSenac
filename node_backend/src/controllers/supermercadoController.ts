import { Request, Response } from 'express';
import { SupermercadoService } from '../services/supermercadoService';
import { PriceImportService } from '../services/priceImportService';
import { logger } from '../lib/logger';

const supermercadoService = new SupermercadoService();

function marketIdFromRequest(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new Error('INVALID_MARKET_ID');
  return id;
}

async function ensureManagePermission(req: Request, marketId: number): Promise<void> {
  if (!req.auth) throw new Error('AUTH_REQUIRED');
  const allowed = await supermercadoService.podeGerenciar(req.auth.accountId, req.auth.role, marketId);
  if (!allowed) throw new Error('MARKET_FORBIDDEN');
}

export class SupermercadoController {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const novoMercado = await supermercadoService.cadastrar(req.body);
      res.status(201).json({ mensagem: 'Supermercado cadastrado com sucesso.', dados: novoMercado });
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'INVALID_MARKET' || code === 'INVALID_COORDINATES') {
        res.status(400).json({ erro: 'Dados do supermercado inválidos.' });
        return;
      }
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        res.status(409).json({ erro: 'CNPJ já cadastrado.' });
        return;
      }
      logger.error('market_create_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao cadastrar supermercado.' });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const latitude = req.query.lat == null ? null : Number(req.query.lat);
      const longitude = req.query.lng == null ? null : Number(req.query.lng);
      const mercados = await supermercadoService.listarTodos({
        userId: req.auth?.userId,
        latitude,
        longitude,
      });
      res.status(200).json(mercados);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'INVALID_COORDINATES') {
        res.status(400).json({ erro: 'Coordenadas inválidas.' });
        return;
      }
      logger.error('market_list_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao listar supermercados.' });
    }
  }

  async listarFavoritos(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(403).json({ erro: 'Favoritos disponíveis apenas para usuários.' });
      return;
    }
    try {
      const mercados = await supermercadoService.listarTodos({ userId, somenteFavoritos: true });
      res.status(200).json(mercados);
    } catch (error) {
      logger.error('market_favorites_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao listar favoritos.' });
    }
  }

  async adicionarFavorito(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(403).json({ erro: 'Favoritos disponíveis apenas para usuários.' });
      return;
    }
    try {
      const marketId = marketIdFromRequest(req);
      await supermercadoService.adicionarFavorito(userId, marketId);
      res.status(204).send();
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'INVALID_MARKET_ID') { res.status(400).json({ erro: 'Supermercado inválido.' }); return; }
      if (code === 'MARKET_NOT_FOUND') { res.status(404).json({ erro: 'Supermercado não encontrado.' }); return; }
      logger.error('market_favorite_add_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao favoritar supermercado.' });
    }
  }

  async removerFavorito(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(403).json({ erro: 'Favoritos disponíveis apenas para usuários.' });
      return;
    }
    try {
      const marketId = marketIdFromRequest(req);
      await supermercadoService.removerFavorito(userId, marketId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_MARKET_ID') {
        res.status(400).json({ erro: 'Supermercado inválido.' });
        return;
      }
      logger.error('market_favorite_remove_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao remover favorito.' });
    }
  }

  async meusMercados(req: Request, res: Response): Promise<void> {
    if (!req.auth) { res.status(401).json({ erro: 'Autenticação obrigatória.' }); return; }
    try {
      const markets = await supermercadoService.mercadosDoResponsavel(req.auth.accountId);
      res.status(200).json(markets);
    } catch (error) {
      logger.error('market_managed_list_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao listar supermercados vinculados.' });
    }
  }

  async produtosOperacao(req: Request, res: Response): Promise<void> {
    try {
      const marketId = marketIdFromRequest(req);
      await ensureManagePermission(req, marketId);
      const term = typeof req.query.busca === 'string' ? req.query.busca : '';
      const page = Math.max(1, Number(req.query.page ?? 1) || 1);
      const pageSize = Math.min(100, Math.max(10, Number(req.query.page_size ?? 50) || 50));
      const products = await supermercadoService.listarProdutosOperacao(marketId, term, page, pageSize);
      res.status(200).json(products);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'INVALID_MARKET_ID') { res.status(400).json({ erro: 'Supermercado inválido.' }); return; }
      if (code === 'MARKET_FORBIDDEN') { res.status(403).json({ erro: 'Você não pode gerenciar este supermercado.' }); return; }
      logger.error('market_products_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao listar produtos.' });
    }
  }


  async inconsistencias(req: Request, res: Response): Promise<void> {
    try {
      const marketId = marketIdFromRequest(req);
      await ensureManagePermission(req, marketId);
      const type = typeof req.query.tipo === 'string' ? req.query.tipo : '';
      const page = Math.max(1, Number(req.query.page ?? 1) || 1);
      const pageSize = Math.min(100, Math.max(10, Number(req.query.page_size ?? 50) || 50));
      const result = await supermercadoService.listarInconsistencias(marketId, type, page, pageSize);
      res.status(200).json(result);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'INVALID_MARKET_ID' || code === 'INVALID_INCONSISTENCY_TYPE') {
        res.status(400).json({ erro: 'Filtro de inconsistência inválido.' });
        return;
      }
      if (code === 'MARKET_FORBIDDEN') {
        res.status(403).json({ erro: 'Você não pode gerenciar este supermercado.' });
        return;
      }
      logger.error('market_inconsistencies_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao listar inconsistências do catálogo.' });
    }
  }

  async atualizarPreco(req: Request, res: Response): Promise<void> {
    try {
      const marketId = marketIdFromRequest(req);
      const productId = Number(req.params.productId);
      if (!Number.isInteger(productId) || productId <= 0) throw new Error('INVALID_PRODUCT_ID');
      await ensureManagePermission(req, marketId);
      if (!req.auth) throw new Error('AUTH_REQUIRED');

      await supermercadoService.atualizarPreco({
        accountId: req.auth.accountId,
        marketId,
        productId,
        price: Number(req.body?.preco),
        loyaltyPrice: req.body?.preco_fidelidade == null ? null : Number(req.body.preco_fidelidade),
      });
      res.status(204).send();
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'INVALID_MARKET_ID' || code === 'INVALID_PRODUCT_ID' || code === 'INVALID_PRICE') { res.status(400).json({ erro: 'Dados de atualização inválidos.' }); return; }
      if (code === 'MARKET_FORBIDDEN') { res.status(403).json({ erro: 'Você não pode gerenciar este supermercado.' }); return; }
      if (code === 'PRODUCT_NOT_FOUND') { res.status(404).json({ erro: 'Produto não encontrado.' }); return; }
      logger.error('market_price_update_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao atualizar preço.' });
    }
  }

  async validarImportacao(req: Request, res: Response): Promise<void> {
    try {
      const marketId = marketIdFromRequest(req);
      await ensureManagePermission(req, marketId);
      const validation = PriceImportService.validate(req.body?.registros);
      res.status(200).json({
        checksum: validation.checksum,
        total_registros: validation.total,
        registros_validos: validation.validos.length,
        registros_invalidos: validation.erros.length,
        preview: validation.validos.slice(0, 20),
        erros: validation.erros.slice(0, 100),
      });
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'INVALID_MARKET_ID' || code === 'INVALID_IMPORT_SIZE') { res.status(400).json({ erro: 'Importação inválida.' }); return; }
      if (code === 'MARKET_FORBIDDEN') { res.status(403).json({ erro: 'Você não pode gerenciar este supermercado.' }); return; }
      logger.error('market_import_validate_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao validar importação.' });
    }
  }

  async aplicarImportacao(req: Request, res: Response): Promise<void> {
    try {
      const marketId = marketIdFromRequest(req);
      await ensureManagePermission(req, marketId);
      if (!req.auth) throw new Error('AUTH_REQUIRED');
      const format = String(req.body?.formato ?? '').toUpperCase();
      if (format !== 'CSV' && format !== 'JSON') throw new Error('INVALID_FORMAT');
      const fileName = String(req.body?.nome_arquivo ?? '').trim();
      if (!fileName) throw new Error('INVALID_FILE_NAME');

      const result = await PriceImportService.apply({
        accountId: req.auth.accountId,
        marketId,
        format,
        fileName,
        records: req.body?.registros,
      });
      res.status(201).json(result);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'INVALID_MARKET_ID' || code === 'INVALID_IMPORT_SIZE' || code === 'INVALID_FORMAT' || code === 'INVALID_FILE_NAME') {
        res.status(400).json({ erro: 'Importação inválida.' }); return;
      }
      if (code === 'IMPORT_HAS_ERRORS') {
        const validation = (error as Error & { validation?: unknown }).validation;
        res.status(422).json({ erro: 'Corrija os registros inválidos antes de importar.', validacao: validation }); return;
      }
      if (code === 'DUPLICATE_IMPORT') { res.status(409).json({ erro: 'Este conteúdo já foi importado para o supermercado.' }); return; }
      if (code === 'MARKET_FORBIDDEN') { res.status(403).json({ erro: 'Você não pode gerenciar este supermercado.' }); return; }
      logger.error('market_import_apply_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao importar preços.' });
    }
  }

  async historicoImportacoes(req: Request, res: Response): Promise<void> {
    try {
      const marketId = marketIdFromRequest(req);
      await ensureManagePermission(req, marketId);
      const history = await PriceImportService.history(marketId, Number(req.query.limit ?? 50));
      res.status(200).json(history);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'INVALID_MARKET_ID') { res.status(400).json({ erro: 'Supermercado inválido.' }); return; }
      if (code === 'MARKET_FORBIDDEN') { res.status(403).json({ erro: 'Você não pode gerenciar este supermercado.' }); return; }
      logger.error('market_import_history_failed', error, { requestId: req.requestId });
      res.status(500).json({ erro: 'Erro ao consultar histórico de importações.' });
    }
  }
}
