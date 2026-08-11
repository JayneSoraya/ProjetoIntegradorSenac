import { Router } from 'express';
import { autenticar, autorizar } from '../middleware/authMiddleware';
import { atualizarMeuPerfil, excluirMinhaConta, exportarMeusDados, meuPerfil } from '../controllers/userController';
import { fixedWindowRateLimit } from '../middleware/securityMiddleware';

const router = Router();
const privacyRateLimit = fixedWindowRateLimit({ windowMs: 60 * 60 * 1000, max: 10, scope: 'account' });

router.use(autenticar, autorizar('USUARIO'));
router.get('/me', meuPerfil);
router.put('/me', atualizarMeuPerfil);
router.get('/me/exportar', privacyRateLimit, exportarMeusDados);
router.delete('/me', privacyRateLimit, excluirMinhaConta);

export default router;
