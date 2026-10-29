"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processarNota = void 0;
const notaService_1 = require("../services/notaService");
const logger_1 = require("../utils/logger");
const processarNota = async (req, res) => {
    const { url_qrcode } = req.body;
    if (!url_qrcode) {
        return res.status(400).json({ erro: 'URL do QR code é obrigatória.' });
    }
    try {
        if (!req.usuario) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }
        const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
        const resultado = await notaService_1.NotaService.processarNotaPorUrl(url_qrcode, idUsuario);
        return res.status(200).json(resultado);
    }
    catch (erro) {
        logger_1.logger.error('❌ Erro ao processar nota:', { erro: erro.message });
        return res.status(500).json({
            erro: 'Erro ao processar a nota fiscal.',
            detalhe: erro.message,
        });
    }
};
exports.processarNota = processarNota;
