import { Router } from 'express';
import { processarNota } from '../controllers/nota.controller';
import { autenticar, autorizar } from '../middleware/authMiddleware';
import { fixedWindowRateLimit } from '../middleware/securityMiddleware';

const router = Router();
const nfceRateLimit = fixedWindowRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  scope: 'account',
  message: 'Limite de processamento de NFC-e atingido. Tente novamente mais tarde.',
});
router.post('/processar', autenticar, autorizar('USUARIO'), nfceRateLimit, processarNota);
export default router;
