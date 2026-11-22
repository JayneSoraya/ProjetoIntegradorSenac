import { Router } from 'express';
import { apiLimiter, criticoLimiter } from '../middleware/rateLimitMiddleware';
import { autenticar } from '../middleware/authMiddleware';
import { processarNota, importarHtmlSefaz } from '../controllers/notaController';
import { sincronizarNotaContingencia } from '../controllers/historicoController';

const router = Router();

router.use(apiLimiter);
router.use(autenticar);

// Rotas protegidas com o Rate Limiter
router.post('/processar', criticoLimiter, processarNota);
router.post('/:id/importar-html', criticoLimiter, importarHtmlSefaz);
router.post('/:id/sincronizar', criticoLimiter, sincronizarNotaContingencia);

export default router;