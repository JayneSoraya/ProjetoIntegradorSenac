import { Router } from 'express';
import { buscarResumo } from '../controllers/economiacontroller';
import { autenticar } from '../middleware/authMiddleware';

const router = Router();

router.get('/resumo', autenticar, buscarResumo);

export default router;