import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { logger } from '../utils/logger';
import { pool } from '../database';

export const listarMercados = async (req: Request, res: Response) => {
  try {
    const dados = await AdminService.listarMercados();
    return res.status(200).json(dados);
  } catch (erro) {
    logger.error(`Erro ao listar mercados: ${erro instanceof Error ? erro.message : String(erro)}`);
    return res.status(500).json({ erro: 'Erro ao buscar mercados.' });
  }
};

export const cadastrarMercado = async (req: Request, res: Response) => {
  try {
    const novoMercado = await AdminService.cadastrarMercado(req.body);
    return res.status(201).json(novoMercado);
  } catch (erro: any) {
    if (erro.message === 'CNPJ, nome e endereço são obrigatórios.') {
      return res.status(400).json({ erro: erro.message });
    }
    logger.error(`Erro ao cadastrar mercado: ${erro instanceof Error ? erro.message : String(erro)}`);
    return res.status(500).json({ erro: 'Erro ao cadastrar mercado.' });
  }
};

export const editarMercado = async (req: Request, res: Response) => {
  // Garante que o id seja tratado como string de forma segura
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  
  if (!id) {
    return res.status(400).json({ erro: 'ID do mercado não fornecido.' });
  }

  try {
    const mercadoAtualizado = await AdminService.editarMercado(id, req.body);
    return res.status(200).json(mercadoAtualizado);
  } catch (erro: any) {
    if (erro.message === 'Mercado não encontrado.') {
      return res.status(404).json({ erro: erro.message });
    }
    logger.error(`Erro ao editar mercado: ${erro instanceof Error ? erro.message : String(erro)}`);
    return res.status(500).json({ erro: 'Erro ao editar mercado.' });
  }
};

export const removerMercado = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id) {
    return res.status(400).json({ erro: 'ID do mercado não fornecido.' });
  }

  try {
    const resposta = await AdminService.removerMercado(id);
    return res.status(200).json(resposta);
  } catch (erro) {
    logger.error(`Erro ao remover mercado: ${erro instanceof Error ? erro.message : String(erro)}`);
    return res.status(500).json({ erro: 'Erro ao remover mercado.' });
  }
};

export const listarUsuarios = async (req: Request, res: Response) => {
  const { busca } = req.query;
  try {
    const usuarios = await AdminService.listarUsuarios(busca);
    return res.status(200).json(usuarios);
  } catch (erro) {
    logger.error(`Erro ao listar usuários: ${erro instanceof Error ? erro.message : String(erro)}`);
    return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
  }
};

export const bloquearUsuario = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { bloquear } = req.body; 

  if (!id) {
    return res.status(400).json({ erro: 'ID do usuário não fornecido.' });
  }

  try {
    const resposta = await AdminService.bloquearUsuario(id, bloquear);
    return res.status(200).json(resposta);
  } catch (erro) {
    logger.error(`Erro ao bloquear usuário: ${erro instanceof Error ? erro.message : String(erro)}`);
    return res.status(500).json({ erro: 'Erro ao bloquear usuário.' });
  }
};

export const listarProdutosAdmin = async (req: Request, res: Response) => {
  try {
    const dados = await AdminService.listarProdutosAdmin(req.query);
    return res.status(200).json(dados);
  } catch (erro) {
    logger.error(`Erro ao buscar produtos admin: ${erro instanceof Error ? erro.message : String(erro)}`);
    return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
};

export const atualizarProdutoAdmin = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id) {
    return res.status(400).json({ erro: 'ID do produto não fornecido.' });
  }

  try {
    const resposta = await AdminService.atualizarProdutoAdmin(id, req.body);
    return res.status(200).json(resposta);
  } catch (erro) {
    logger.error(`Erro ao atualizar produto: ${erro instanceof Error ? erro.message : String(erro)}`);
    return res.status(500).json({ erro: 'Erro ao atualizar produto.' });
  }
};

export const removerProdutoAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'DELETE FROM produtos WHERE id_produto = $1 RETURNING id_produto, nome',
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    logger.info(`🗑️ Produto #${id} (${resultado.rows[0].nome}) removido pelo admin.`);
    return res.json({ mensagem: 'Produto excluído com sucesso.' });
  } catch (error: any) {
    // Código 23503 no PostgreSQL = violação de chave estrangeira (produto vinculado a notas/preços)
    if (error.code === '23503') {
      return res.status(409).json({
        erro: 'Este produto possui preços ou notas fiscais vinculadas e não pode ser apagado.',
      });
    }

    logger.error(`❌ Erro ao remover produto #${id}: ${error.message}`);
    return res.status(500).json({ erro: 'Erro interno ao excluir produto.' });
  }
};