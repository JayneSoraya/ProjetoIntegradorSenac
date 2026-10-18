import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { cadastrarUsuario, loginUsuario } from '../controllers/authController'

const router = Router();
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5,
  message: 'Muitas requisições feitas a partir deste IP, por favor tente novamente mais tarde.',
});

router.use(authLimiter);

router.post('/cadastro', cadastrarUsuario);
router.post('/login', loginUsuario);


export default router;

