"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterEconomia = exports.buscarResumo = void 0;
const economiaService_1 = require("../services/economiaService");
const logger_1 = require("../utils/logger");
const buscarResumo = async (req, res) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }
        const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
        const resumo = await economiaService_1.EconomiaService.obterResumoUsuario(idUsuario);
        return res.status(200).json(resumo);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao buscar resumo:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao buscar dados.' });
    }
};
exports.buscarResumo = buscarResumo;
const obterEconomia = async (req, res) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }
        const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
        const economia = await economiaService_1.EconomiaService.calcularEconomia(idUsuario);
        return res.status(200).json(economia);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao calcular economia:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao calcular economia.' });
    }
};
exports.obterEconomia = obterEconomia;
