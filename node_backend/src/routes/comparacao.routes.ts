import { Router } from 'express';
import { autenticar, autorizar } from '../middleware/authMiddleware';
import { ComparacaoController } from '../controllers/comparacao.controller';
import { fixedWindowRateLimit } from '../middleware/securityMiddleware';

const router = Router();
const controller = new ComparacaoController();

const comparacaoRateLimit = fixedWindowRateLimit({
  windowMs: 60 * 1000,
  max: 30,
  scope: 'account',
  message: 'Muitas comparações seguidas. Aguarde um instante e tente novamente.',
});

router.use(autenticar, autorizar('USUARIO'));
router.post('/', comparacaoRateLimit, controller.comparar);
router.get('/historico', controller.historico);
router.get('/:id', controller.detalhe);

export default router;
