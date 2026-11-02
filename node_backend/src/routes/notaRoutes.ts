import { Router } from "express";
import { processarNota, importarHtmlSefaz } from '../controllers/notaController';
import { sincronizarNotaContingencia } from '../controllers/historicoController';
import { autenticar } from '../middleware/authMiddleware';

const router = Router();

router.use(autenticar);

router.post('/processar', processarNota);
router.post('/:id/sincronizar', sincronizarNotaContingencia);

router.post('/:id/importar-html', importarHtmlSefaz);

export default router;