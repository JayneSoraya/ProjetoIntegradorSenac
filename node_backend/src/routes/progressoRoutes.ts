import { Router } from 'express';
import { autenticar } from '../middleware/authMiddleware';
import { buscarProgresso } from '../controllers/progressoController';

const router = Router();

router.get('/', autenticar, buscarProgresso);

export default router;