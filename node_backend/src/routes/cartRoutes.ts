import { Router } from 'express';
import { autenticar, autorizar } from '../middleware/authMiddleware';
import { limparCarrinho, obterCarrinho, substituirCarrinho } from '../controllers/cartController';

const router = Router();
router.use(autenticar, autorizar('USUARIO'));
router.get('/', obterCarrinho);
router.put('/', substituirCarrinho);
router.delete('/', limparCarrinho);

export default router;
