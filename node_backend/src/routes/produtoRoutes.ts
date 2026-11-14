import { Router } from 'express';
import { ProdutoController } from '../controllers/produtoController';
import { autenticar } from '../middleware/authMiddleware';

const router = Router();

// RF05 — buscar produtos
router.get('/', autenticar, ProdutoController.buscar);

// RF07 — detalhe do produto 
router.get('/:id', autenticar, ProdutoController.buscarDetalhe);

export default router;