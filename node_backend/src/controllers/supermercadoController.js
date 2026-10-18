import { SupermercadoService } from '../services/supermercadoService';
import { logger } from '../utils/logger';
export class SupermercadoController {
    static async criar(req, res) {
        try {
            const novoMercado = await SupermercadoService.cadastrar(req.body);
            res.status(201).json({
                mensagem: 'Supermercado cadastrado com sucesso! 🏪',
                dados: novoMercado
            });
        }
        catch (error) {
            logger.error('❌ Erro ao cadastrar supermercado:', { erro: error.message });
            res.status(500).json({
                erro: error.message
            });
        }
    }
    static async listar(req, res) {
        try {
            const mercados = await SupermercadoService.listarTodos();
            res.status(200).json(mercados);
        }
        catch (error) {
            logger.error('❌ Erro ao listar supermercados:', { erro: error.message });
            res.status(500).json({
                erro: error.message
            });
        }
    }
    static async meuPerfil(req, res) {
        try {
            if (!req.usuario) {
                res.status(401).json({
                    erro: 'Usuário não autenticado'
                });
                return;
            }
            const idConta = req.usuario.id_conta;
            const mercado = await SupermercadoService.buscarPorIdConta(idConta);
            if (!mercado) {
                res.status(404).json({
                    erro: 'Mercado não encontrado'
                });
                return;
            }
            res.status(200).json(mercado);
        }
        catch (error) {
            logger.error('❌ Erro ao buscar perfil do mercado:', { erro: error.message });
            res.status(500).json({
                erro: 'Erro ao buscar perfil do mercado'
            });
        }
    }
}
