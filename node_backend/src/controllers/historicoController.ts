import { Request, Response } from 'express';
import { HistoricoService } from '../services/historicoService';
import { logger } from '../utils/logger';

export const listarCompras = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  const { id_usuario } = req.usuario;

  try {
    const resultado = await HistoricoService.listarCompras(id_usuario);
    return res.status(200).json(resultado);
  } catch (erro: any) {
    logger.error(`❌ Erro ao buscar histórico de compras ${erro.message}`);
    return res.status(500).json({ erro: 'Erro ao buscar histórico de compras.' });
  }
};

export const detalheCompra = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { id_usuario } = req.usuario;

  if (!id) {
    return res.status(400).json({ erro: 'ID da nota não fornecido.' });
  }

  try {
    const detalhe = await HistoricoService.detalheCompra(id, id_usuario);
    return res.status(200).json(detalhe);
  } catch (erro: any) {
    if (erro.message === 'NOTA_NAO_ENCONTRADA') {
      return res.status(404).json({ erro: 'Nota não encontrada.' });
    }

    logger.error(`❌ Erro ao buscar detalhe da compra: ${erro.message}`);
    return res.status(500).json({ erro: 'Erro ao buscar detalhe da compra.' });
  }
};

export const historicoPrecoProduto = async (req: Request, res: Response) => {
  const id_produto = Array.isArray(req.params.id_produto) ? req.params.id_produto[0] : req.params.id_produto;

  if (!id_produto) {
    return res.status(400).json({ erro: 'ID do produto não fornecido.' });
  }

  try {
    const dadosHistorico = await HistoricoService.historicoPrecoProduto(id_produto);
    return res.status(200).json(dadosHistorico);
  } catch (erro: any) {
    if (erro.message === 'PRODUTO_NAO_ENCONTRADO') {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    logger.error(`❌ Erro ao buscar histórico de preços: ${erro.message}`);
    return res.status(500).json({ erro: 'Erro ao buscar histórico de preços.' });
  }
};

export const resumoEconomia = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  const { id_usuario } = req.usuario;

  try {
    const resumo = await HistoricoService.resumoEconomia(id_usuario);
    return res.status(200).json(resumo);
  } catch (erro: any) {
    logger.error(`❌ Erro ao buscar resumo: ${erro.message}`);
    return res.status(500).json({ erro: 'Erro ao buscar resumo.' });
  }
};

export const sincronizarNotaContingencia = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const idUsuario = req.usuario?.id_usuario;

  if (!idUsuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  if (!id) {
    return res.status(400).json({ erro: 'ID da nota não fornecido.' });
  }

  try {
    const resposta = await HistoricoService.sincronizarNotaContingencia(id, idUsuario);
    logger.info(`✅ Nota ID ${id} sincronizada manualmente com sucesso pelo usuário ${idUsuario}`);
    return res.status(200).json(resposta);
  } catch (erro: any) {
    if (erro.message === 'NOTA_NAO_ENCONTRADA') {
      return res.status(404).json({ erro: 'Nota fiscal não encontrada.' });
    }

    if (erro.message === 'NOTA_JA_PROCESSADA') {
      return res.status(400).json({ mensagem: 'Esta nota já foi processada.' });
    }

    logger.warn(`⚠️ Falha no scraping manual (Contingência mantida): ${erro.message}`);

    const chaveNfce = await HistoricoService.obterChaveNfce(id);

    return res.status(422).json({
      sucesso: false,
      contingencia: true,
      erro: 'Nota fiscal em contingência ou com assinatura inconsistente na SEFAZ. Necessária validação manual.',
      chave_nfce: chaveNfce, 
      detalhe: erro.message,
    });
  }
};