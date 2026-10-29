"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumoEconomia = exports.historicoPrecoProduto = exports.detalheCompra = exports.listarCompras = void 0;
const historicoService_1 = require("../services/historicoService");
const logger_1 = require("../utils/logger");
// Lista todas as notas fiscais do usuário logado
const listarCompras = async (req, res) => {
    if (!req.usuario) {
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
    try {
        const resultado = await historicoService_1.HistoricoService.listarPorUsuario(idUsuario);
        return res.status(200).json(resultado);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao listar compras:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao buscar histórico de compras.' });
    }
};
exports.listarCompras = listarCompras;
// Detalhe de uma nota: lista todos os itens comprados
const detalheCompra = async (req, res) => {
    if (!req.usuario) {
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
    if (!id) {
        return res.status(400).json({ erro: 'ID da nota não fornecido.' });
    }
    try {
        const detalhe = await historicoService_1.HistoricoService.detalharCompra(id, idUsuario);
        if (!detalhe) {
            return res.status(404).json({ erro: 'Nota não encontrada.' });
        }
        return res.status(200).json(detalhe);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao buscar detalhe da compra:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao buscar detalhe da compra.' });
    }
};
exports.detalheCompra = detalheCompra;
// Histórico de variação de preço de um produto específico
const historicoPrecoProduto = async (req, res) => {
    const rawIdProduto = req.params.id_produto;
    const id_produto = Array.isArray(rawIdProduto) ? rawIdProduto[0] : rawIdProduto;
    if (!id_produto) {
        return res.status(400).json({ erro: 'ID do produto não fornecido.' });
    }
    try {
        const dados = await historicoService_1.HistoricoService.historicoPrecoProduto(id_produto);
        if (!dados) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }
        return res.status(200).json(dados);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao buscar histórico de preços:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao buscar histórico de preços.' });
    }
};
exports.historicoPrecoProduto = historicoPrecoProduto;
// Resumo de economia do usuário
const resumoEconomia = async (req, res) => {
    if (!req.usuario) {
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
    try {
        const resumo = await historicoService_1.HistoricoService.resumoEconomia(idUsuario);
        return res.status(200).json(resumo);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao buscar resumo:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao buscar resumo.' });
    }
};
exports.resumoEconomia = resumoEconomia;
