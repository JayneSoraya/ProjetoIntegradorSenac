import { Router } from 'express';
import { cadastrarUsuario, loginUsuario, logout, minhaConta, recuperarSenha } from '../controllers/authController';
import { autenticar } from '../middleware/authMiddleware';
import { fixedWindowRateLimit, loginRateLimit } from '../middleware/securityMiddleware';

const router = Router();
const registrationRateLimit = fixedWindowRateLimit({ windowMs: 60 * 60 * 1000, max: 20, scope: 'ip' });

router.post('/cadastro', registrationRateLimit, cadastrarUsuario);
router.post('/login', loginRateLimit, loginUsuario);
router.post('/logout', logout);
router.post('/recuperar-senha', recuperarSenha);
router.get('/me', autenticar, minhaConta);

export default router;
