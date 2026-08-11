import { Router } from 'express';
import { autenticar, autorizar } from '../middleware/authMiddleware';
import { ComparacaoController } from '../controllers/comparacao.controller';

const router = Router();
const controller = new ComparacaoController();

router.use(autenticar, autorizar('USUARIO'));
router.post('/', controller.comparar);
router.get('/historico', controller.historico);
router.get('/:id', controller.detalhe);

export default router;
