import { Router } from 'express';
import { ProdutoController } from '../controllers/produtoController';
import { autenticar } from '../middleware/authMiddleware';

const router = Router();
const controller = new ProdutoController();

// RF05 — buscar produtos 
router.get('/', autenticar, controller.buscar);

// RF07 — detalhe do produto 
router.get('/:id', autenticar, controller.buscarDetalhe);

export default router;