import { Router } from 'express';
import { SupermercadoController } from '../controllers/supermercadoController';

const router = Router();
const supermercadoController = new SupermercadoController();

// Rotas para /api/supermercados
router.post('/', supermercadoController.criar);
router.get('/', supermercadoController.listar);

export default router;