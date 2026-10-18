import { Request, Response } from 'express';
import { SupermercadoService } from '../services/supermercadoService';
import { ProdutoService } from '../services/produtoService';
import { UsuarioService } from '../services/usuarioService'; 
import { logger } from '../utils/logger';

// ── GET /api/admin/mercados ────────────────────────────────
export const listarMercados = async (req: Request, res: Response) => {
  try {
    const mercados = await SupermercadoService.listarTodos();
    return res.status(200).json(mercados);
  } catch (erro) {
    logger.error('❌ Erro ao listar mercados:', { erro });
    return res.status(500).json({ erro: 'Erro ao buscar mercados.' });
  }
};

// ── POST /api/admin/mercados ───────────────────────────────
export const cadastrarMercado = async (req: Request, res: Response) => {
  const { cnpj, nome_fantasia, endereco_completo } = req.body;

  if (!cnpj || !nome_fantasia || !endereco_completo) {
    return res.status(400).json({ erro: 'CNPJ, nome e endereço são obrigatórios.' });
  }

  try {
    const novoMercado = await SupermercadoService.cadastrar({
      nome: nome_fantasia,
      logradouro: endereco_completo,
      cnpj,
    });
    return res.status(201).json(novoMercado);
  } catch (erro) {
    logger.error('❌ Erro ao cadastrar mercado:', { erro });
    return res.status(500).json({ erro: 'Erro ao cadastrar mercado.' });
  }
};

// ── PUT /api/admin/mercados/:id ────────────────────────────
export const editarMercado = async (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = typeof idParam === 'string' ? idParam : (Array.isArray(idParam) ? idParam[0] : '');
  const { nome_fantasia, endereco_completo, esta_aberto } = req.body;

  try {
    const mercadoAtualizado = await SupermercadoService.atualizar(id, {
      nome: nome_fantasia,
      logradouro: endereco_completo,
      esta_aberto,
    });
    if (!mercadoAtualizado) {
      return res.status(404).json({ erro: 'Mercado não encontrado.' });
    }
    return res.status(200).json(mercadoAtualizado);
  } catch (erro) {
    logger.error('❌ Erro ao editar mercado:', { erro });
    return res.status(500).json({ erro: 'Erro ao editar mercado.' });
  }
};

// ── DELETE /api/admin/mercados/:id ─────────────────────────
export const removerMercado = async (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = typeof idParam === 'string' ? idParam : (Array.isArray(idParam) ? idParam[0] : '');
  try {
    await SupermercadoService.remover(id);
    return res.status(200).json({ mensagem: 'Mercado removido.' });
  } catch (erro) {
    logger.error('❌ Erro ao remover mercado:', { erro });
    return res.status(500).json({ erro: 'Erro ao remover mercado.' });
  }
};

// ── GET /api/admin/usuarios ────────────────────────────────
export const listarUsuarios = async (req: Request, res: Response) => {
  const buscaParam = req.query.busca;
  const busca = typeof buscaParam === 'string' ? buscaParam : '';

  try {
    const usuarios = await UsuarioService.listarUsuarios(busca);
    return res.status(200).json(usuarios);
  } catch (erro) {
    logger.error('❌ Erro ao listar usuários:', { erro });
    return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
  }
};

export const bloquearUsuario = async (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = typeof idParam === 'string' ? idParam : (Array.isArray(idParam) ? idParam[0] : '');
  const { bloquear } = req.body; 
  try {
    await UsuarioService.bloquearUsuario(id, bloquear);
    return res.status(200).json({
      mensagem: bloquear ? 'Usuário bloqueado.' : 'Usuário desbloqueado.',
    });
  } catch (erro) {
    logger.error('❌ Erro ao bloquear usuário:', { erro });
    return res.status(500).json({ erro: 'Erro ao bloquear usuário.' });
  }
};

// ── PRODUTOS ADMIN ─────────────────────────────────────────
export const listarProdutosAdmin = async (req: Request, res: Response) => {
  const buscaParam = req.query.busca;
  const busca = typeof buscaParam === 'string' ? buscaParam : '';

  try {
    const produtos = await ProdutoService.buscar(busca);
    return res.status(200).json(produtos);
  } catch (erro) {
    logger.error('❌ Erro ao buscar produtos:', { erro });
    return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
};

export const corrigirCategoria = async (req: Request, res: Response) => {
  const idParam = req.params.id;
  const idStr = typeof idParam === 'string' ? idParam : (Array.isArray(idParam) ? idParam[0] : '');
  const id = Number(idStr);
  const { categoria } = req.body;
  try {
    await ProdutoService.corrigirCategoria(id, categoria);
    return res.status(200).json({ mensagem: 'Categoria atualizada.' });
  } catch (erro) {
    logger.error('❌ Erro ao atualizar categoria:', { erro });
    return res.status(500).json({ erro: 'Erro ao atualizar categoria.' });
  }
};