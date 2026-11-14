import { Router } from 'express';
import { SupermercadoController } from '../controllers/supermercadoController';
import { autenticar } from '../middleware/authMiddleware';

const router = Router();

// Rotas limpas e seguras baseadas em métodos estáticos
router.post('/', SupermercadoController.criar);
router.get('/', SupermercadoController.listar);
router.get('/meu-perfil', autenticar, SupermercadoController.meuPerfil);
router.put('/:id', autenticar, SupermercadoController.atualizar);

export default router;