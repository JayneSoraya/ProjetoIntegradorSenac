import { Router } from 'express';
import { SupermercadoController } from '../controllers/supermercadoController';
import { autenticar } from '../middleware/authMiddleware';
import { apiLimiter } from '../middleware/rateLimitMiddleware';

const router = Router();

router.use(apiLimiter);

// Rotas limpas e seguras
router.post('/', SupermercadoController.criar);
router.get('/', SupermercadoController.listar);
router.get('/meu-perfil', autenticar, SupermercadoController.meuPerfil);
router.put('/:id', autenticar, SupermercadoController.atualizar);

export default router;