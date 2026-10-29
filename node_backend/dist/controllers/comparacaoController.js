"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComparacaoController = void 0;
const comparacaoService_1 = require("../services/comparacaoService");
const logger_1 = require("../utils/logger");
class ComparacaoController {
    comparar = async (req, res) => {
        try {
            const { itens } = req.body;
            if (!itens || !Array.isArray(itens) || itens.length === 0) {
                res.status(400).json({
                    erro: 'Carrinho vazio.',
                });
                return;
            }
            const resultado = await comparacaoService_1.ComparacaoService.compararCarrinho(itens);
            res.status(200).json(resultado);
        }
        catch (erro) {
            logger_1.logger.error('❌ Erro ao comparar mercados:', { erro: erro.message });
            res.status(500).json({
                erro: 'Erro ao comparar mercados.',
            });
        }
    };
}
exports.ComparacaoController = ComparacaoController;
