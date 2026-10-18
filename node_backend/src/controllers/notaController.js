import { NotaService } from '../services/notaService';
import { logger } from '../utils/logger';
export const processarNota = async (req, res) => {
    const { url_qrcode } = req.body;
    if (!url_qrcode) {
        return res.status(400).json({ erro: 'URL do QR code é obrigatória.' });
    }
    try {
        if (!req.usuario) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }
        const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
        const resultado = await NotaService.processarNotaPorUrl(url_qrcode, idUsuario);
        return res.status(200).json(resultado);
    }
    catch (erro) {
        logger.error('❌ Erro ao processar nota:', { erro: erro.message });
        return res.status(500).json({
            erro: 'Erro ao processar a nota fiscal.',
            detalhe: erro.message,
        });
    }
};
