import { Router } from 'express';
import { detalharCompra, listarCompras, precosDoProduto } from '../controllers/historicoController';
import { autenticar, autorizar } from '../middleware/authMiddleware';
import { fixedWindowRateLimit } from '../middleware/securityMiddleware';

const router = Router();
const leituraRateLimit = fixedWindowRateLimit({
  windowMs: 60 * 1000,
  max: 120,
  scope: 'account',
  message: 'Muitas consultas ao histórico. Aguarde um instante e tente novamente.',
});

router.use(autenticar, autorizar('USUARIO'), leituraRateLimit);
router.get('/compras', listarCompras);
router.get('/compras/:id', detalharCompra);
router.get('/precos/:idProduto', precosDoProduto);

export default router;
