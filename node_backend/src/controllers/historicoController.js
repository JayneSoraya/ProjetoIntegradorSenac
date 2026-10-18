import { HistoricoService } from '../services/historicoService';
import { logger } from '../utils/logger';
// Lista todas as notas fiscais do usuário logado
export const listarCompras = async (req, res) => {
    if (!req.usuario) {
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
    try {
        const resultado = await HistoricoService.listarPorUsuario(idUsuario);
        return res.status(200).json(resultado);
    }
    catch (erro) {
        logger.error('❌ Erro ao listar compras:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao buscar histórico de compras.' });
    }
};
// Detalhe de uma nota: lista todos os itens comprados
export const detalheCompra = async (req, res) => {
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
        const detalhe = await HistoricoService.detalharCompra(id, idUsuario);
        if (!detalhe) {
            return res.status(404).json({ erro: 'Nota não encontrada.' });
        }
        return res.status(200).json(detalhe);
    }
    catch (erro) {
        logger.error('❌ Erro ao buscar detalhe da compra:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao buscar detalhe da compra.' });
    }
};
// Histórico de variação de preço de um produto específico
export const historicoPrecoProduto = async (req, res) => {
    const rawIdProduto = req.params.id_produto;
    const id_produto = Array.isArray(rawIdProduto) ? rawIdProduto[0] : rawIdProduto;
    if (!id_produto) {
        return res.status(400).json({ erro: 'ID do produto não fornecido.' });
    }
    try {
        const dados = await HistoricoService.historicoPrecoProduto(id_produto);
        if (!dados) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }
        return res.status(200).json(dados);
    }
    catch (erro) {
        logger.error('❌ Erro ao buscar histórico de preços:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao buscar histórico de preços.' });
    }
};
// Resumo de economia do usuário
export const resumoEconomia = async (req, res) => {
    if (!req.usuario) {
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
    try {
        const resumo = await HistoricoService.resumoEconomia(idUsuario);
        return res.status(200).json(resumo);
    }
    catch (erro) {
        logger.error('❌ Erro ao buscar resumo:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao buscar resumo.' });
    }
};
