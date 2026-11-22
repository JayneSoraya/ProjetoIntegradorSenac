import { Router } from 'express';
import { criticoLimiter } from '../middleware/rateLimitMiddleware';
import {
  cadastrarUsuario,
  loginUsuario,
} from '../controllers/authController';

const router = Router();

router.post(
  '/cadastro',
  criticoLimiter,
  cadastrarUsuario,
);

router.post(
  '/login',
  criticoLimiter,
  loginUsuario,
);

export default router;