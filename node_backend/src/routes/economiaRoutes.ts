import { Router } from 'express';
import { buscarResumo } from '../controllers/economiaController';
import { autenticar, autorizar } from '../middleware/authMiddleware';

const router = Router();

router.get('/resumo', autenticar, autorizar('USUARIO'), buscarResumo);

export default router;