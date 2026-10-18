import { ProdutoService } from '../services/produtoService';
import { logger } from '../utils/logger';
export class ProdutoController {
    buscar = async (req, res) => {
        // Pega o termo de busca da query (ex: ?busca=leite)
        const { busca } = req.query;
        try {
            const produtos = await ProdutoService.buscar(busca || '');
            return res.status(200).json(produtos);
        }
        catch (erro) {
            logger.error('❌ Erro ao buscar produtos:', { erro });
            return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
        }
    };
    buscarDetalhe = async (req, res) => {
        const { id } = req.params;
        try {
            const produto = await ProdutoService.buscarDetalhe(Number(id));
            if (!produto) {
                return res.status(404).json({ erro: 'Produto não encontrado.' });
            }
            return res.status(200).json(produto);
        }
        catch (erro) {
            logger.error('❌ Erro ao buscar detalhe:', { erro });
            return res.status(500).json({ erro: 'Erro ao buscar produto.' });
        }
    };
}
