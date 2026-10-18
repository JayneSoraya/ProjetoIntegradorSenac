import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { buscarResumo } from '../controllers/economiaController';
import { autenticar } from '../middleware/authMiddleware';

const router = Router();
const economiaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas requisições feitas a partir deste IP, por favor tente novamente mais tarde.',
});

router.use(economiaLimiter);
router.get('/resumo', autenticar, buscarResumo);

export default router;