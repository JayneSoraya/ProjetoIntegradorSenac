"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corrigirCategoria = exports.listarProdutosAdmin = exports.bloquearUsuario = exports.listarUsuarios = exports.removerMercado = exports.editarMercado = exports.cadastrarMercado = exports.listarMercados = void 0;
const supermercadoService_1 = require("../services/supermercadoService");
const produtoService_1 = require("../services/produtoService");
const usuarioService_1 = require("../services/usuarioService");
const logger_1 = require("../utils/logger");
// ── GET /api/admin/mercados ────────────────────────────────
const listarMercados = async (req, res) => {
    try {
        const mercados = await supermercadoService_1.SupermercadoService.listarTodos();
        return res.status(200).json(mercados);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao listar mercados:', { erro });
        return res.status(500).json({ erro: 'Erro ao buscar mercados.' });
    }
};
exports.listarMercados = listarMercados;
// ── POST /api/admin/mercados ───────────────────────────────
const cadastrarMercado = async (req, res) => {
    const { cnpj, nome_fantasia, endereco_completo } = req.body;
    if (!cnpj || !nome_fantasia || !endereco_completo) {
        return res.status(400).json({ erro: 'CNPJ, nome e endereço são obrigatórios.' });
    }
    try {
        const novoMercado = await supermercadoService_1.SupermercadoService.cadastrar({
            nome: nome_fantasia,
            logradouro: endereco_completo,
            cnpj,
        });
        return res.status(201).json(novoMercado);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao cadastrar mercado:', { erro });
        return res.status(500).json({ erro: 'Erro ao cadastrar mercado.' });
    }
};
exports.cadastrarMercado = cadastrarMercado;
// ── PUT /api/admin/mercados/:id ────────────────────────────
const editarMercado = async (req, res) => {
    const idParam = req.params.id;
    const id = typeof idParam === 'string' ? idParam : (Array.isArray(idParam) ? idParam[0] : '');
    const { nome_fantasia, endereco_completo, esta_aberto } = req.body;
    try {
        const mercadoAtualizado = await supermercadoService_1.SupermercadoService.atualizar(id, {
            nome: nome_fantasia,
            logradouro: endereco_completo,
            esta_aberto,
        });
        if (!mercadoAtualizado) {
            return res.status(404).json({ erro: 'Mercado não encontrado.' });
        }
        return res.status(200).json(mercadoAtualizado);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao editar mercado:', { erro });
        return res.status(500).json({ erro: 'Erro ao editar mercado.' });
    }
};
exports.editarMercado = editarMercado;
// ── DELETE /api/admin/mercados/:id ─────────────────────────
const removerMercado = async (req, res) => {
    const idParam = req.params.id;
    const id = typeof idParam === 'string' ? idParam : (Array.isArray(idParam) ? idParam[0] : '');
    try {
        await supermercadoService_1.SupermercadoService.remover(id);
        return res.status(200).json({ mensagem: 'Mercado removido.' });
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao remover mercado:', { erro });
        return res.status(500).json({ erro: 'Erro ao remover mercado.' });
    }
};
exports.removerMercado = removerMercado;
// ── GET /api/admin/usuarios ────────────────────────────────
const listarUsuarios = async (req, res) => {
    const buscaParam = req.query.busca;
    const busca = typeof buscaParam === 'string' ? buscaParam : '';
    try {
        const usuarios = await usuarioService_1.UsuarioService.listarUsuarios(busca);
        return res.status(200).json(usuarios);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao listar usuários:', { erro });
        return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
    }
};
exports.listarUsuarios = listarUsuarios;
const bloquearUsuario = async (req, res) => {
    const idParam = req.params.id;
    const id = typeof idParam === 'string' ? idParam : (Array.isArray(idParam) ? idParam[0] : '');
    const { bloquear } = req.body;
    try {
        await usuarioService_1.UsuarioService.bloquearUsuario(id, bloquear);
        return res.status(200).json({
            mensagem: bloquear ? 'Usuário bloqueado.' : 'Usuário desbloqueado.',
        });
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao bloquear usuário:', { erro });
        return res.status(500).json({ erro: 'Erro ao bloquear usuário.' });
    }
};
exports.bloquearUsuario = bloquearUsuario;
// ── PRODUTOS ADMIN ─────────────────────────────────────────
const listarProdutosAdmin = async (req, res) => {
    const buscaParam = req.query.busca;
    const busca = typeof buscaParam === 'string' ? buscaParam : '';
    try {
        const produtos = await produtoService_1.ProdutoService.buscar(busca);
        return res.status(200).json(produtos);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao buscar produtos:', { erro });
        return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
    }
};
exports.listarProdutosAdmin = listarProdutosAdmin;
const corrigirCategoria = async (req, res) => {
    const idParam = req.params.id;
    const idStr = typeof idParam === 'string' ? idParam : (Array.isArray(idParam) ? idParam[0] : '');
    const id = Number(idStr);
    const { categoria } = req.body;
    try {
        await produtoService_1.ProdutoService.corrigirCategoria(id, categoria);
        return res.status(200).json({ mensagem: 'Categoria atualizada.' });
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao atualizar categoria:', { erro });
        return res.status(500).json({ erro: 'Erro ao atualizar categoria.' });
    }
};
exports.corrigirCategoria = corrigirCategoria;
