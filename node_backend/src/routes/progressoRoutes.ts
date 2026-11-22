import { Router } from 'express';
import { buscarProgresso } from '../controllers/progressoController';
import { autenticar, autorizar } from '../middleware/authMiddleware';
import { fixedWindowRateLimit } from '../middleware/securityMiddleware';

const router = Router();
const leituraRateLimit = fixedWindowRateLimit({
  windowMs: 60 * 1000,
  max: 60,
  scope: 'account',
  message: 'Muitas consultas de progresso. Aguarde um instante e tente novamente.',
});

router.get('/', autenticar, autorizar('USUARIO'), leituraRateLimit, buscarProgresso);

export default router;
