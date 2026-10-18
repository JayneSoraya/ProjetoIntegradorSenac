import { EconomiaService } from '../services/economiaService';
import { logger } from '../utils/logger';
export const buscarResumo = async (req, res) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }
        const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
        const resumo = await EconomiaService.obterResumoUsuario(idUsuario);
        return res.status(200).json(resumo);
    }
    catch (erro) {
        logger.error('❌ Erro ao buscar resumo:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao buscar dados.' });
    }
};
export const obterEconomia = async (req, res) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }
        const idUsuario = req.usuario.id_usuario ?? req.usuario.id_conta;
        const economia = await EconomiaService.calcularEconomia(idUsuario);
        return res.status(200).json(economia);
    }
    catch (erro) {
        logger.error('❌ Erro ao calcular economia:', { erro: erro.message });
        return res.status(500).json({ erro: 'Erro ao calcular economia.' });
    }
};
