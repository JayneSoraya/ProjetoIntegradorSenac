import { Request, Response } from 'express';
import { parsePaginacao, parseResourceId } from '../domain/historico';
import { logger } from '../lib/logger';
import { HistoricoService } from '../services/historicoService';

function userIdOf(req: Request): number | null {
  return req.auth?.userId ?? null;
}

export async function listarCompras(req: Request, res: Response) {
  const userId = userIdOf(req);
  if (!userId) return res.status(403).json({ erro: 'Histórico disponível apenas para usuários.' });

  try {
    const paginacao = parsePaginacao({
      limite: req.query.limite,
      deslocamento: req.query.deslocamento,
    });
    return res.status(200).json(await HistoricoService.listarCompras(userId, paginacao));
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_PAGINATION') {
      return res.status(400).json({ erro: 'Parâmetros de paginação inválidos.' });
    }
    logger.error('historico_compras_list_failed', error, { requestId: req.requestId, userId });
    return res.status(500).json({ erro: 'Erro ao buscar histórico de compras.' });
  }
}

export async function detalharCompra(req: Request, res: Response) {
  const userId = userIdOf(req);
  if (!userId) return res.status(403).json({ erro: 'Histórico disponível apenas para usuários.' });

  const idNota = parseResourceId(req.params.id);
  if (!idNota) return res.status(400).json({ erro: 'Identificador da nota inválido.' });

  try {
    const detalhe = await HistoricoService.detalharCompra(userId, idNota);
    if (!detalhe) return res.status(404).json({ erro: 'Compra não encontrada.' });
    return res.status(200).json(detalhe);
  } catch (error) {
    logger.error('historico_compras_detail_failed', error, { requestId: req.requestId, userId, idNota });
    return res.status(500).json({ erro: 'Erro ao buscar detalhe da compra.' });
  }
}

export async function precosDoProduto(req: Request, res: Response) {
  const userId = userIdOf(req);
  if (!userId) return res.status(403).json({ erro: 'Histórico disponível apenas para usuários.' });

  const idProduto = parseResourceId(req.params.idProduto);
  if (!idProduto) return res.status(400).json({ erro: 'Identificador do produto inválido.' });

  try {
    const dados = await HistoricoService.precosDoProduto(userId, idProduto);
    if (!dados) return res.status(404).json({ erro: 'Produto não encontrado.' });
    return res.status(200).json(dados);
  } catch (error) {
    logger.error('historico_precos_failed', error, { requestId: req.requestId, userId, idProduto });
    return res.status(500).json({ erro: 'Erro ao buscar preços do produto.' });
  }
}
