"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarProgresso = void 0;
const progressoService_1 = require("../services/progressoService");
const logger_1 = require("../utils/logger");
// GET /api/progresso
const buscarProgresso = async (req, res) => {
    if (!req.usuario) {
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    const { id_usuario } = req.usuario;
    try {
        if (!id_usuario) {
            return res.status(400).json({ erro: 'ID do usuário não encontrado na sessão.' });
        }
        const dadosProgresso = await progressoService_1.ProgressoService.buscarProgressoZeigarnik(id_usuario);
        return res.status(200).json(dadosProgresso);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao buscar progresso:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao buscar progresso.' });
    }
};
exports.buscarProgresso = buscarProgresso;
