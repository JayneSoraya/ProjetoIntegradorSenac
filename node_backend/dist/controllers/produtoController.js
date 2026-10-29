"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoController = void 0;
const produtoService_1 = require("../services/produtoService");
const logger_1 = require("../utils/logger");
class ProdutoController {
    buscar = async (req, res) => {
        // Pega o termo de busca da query (ex: ?busca=leite)
        const { busca } = req.query;
        try {
            const produtos = await produtoService_1.ProdutoService.buscar(busca || '');
            return res.status(200).json(produtos);
        }
        catch (erro) {
            logger_1.logger.error('❌ Erro ao buscar produtos:', { erro });
            return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
        }
    };
    buscarDetalhe = async (req, res) => {
        const { id } = req.params;
        try {
            const produto = await produtoService_1.ProdutoService.buscarDetalhe(Number(id));
            if (!produto) {
                return res.status(404).json({ erro: 'Produto não encontrado.' });
            }
            return res.status(200).json(produto);
        }
        catch (erro) {
            logger_1.logger.error('❌ Erro ao buscar detalhe:', { erro });
            return res.status(500).json({ erro: 'Erro ao buscar produto.' });
        }
    };
}
exports.ProdutoController = ProdutoController;
