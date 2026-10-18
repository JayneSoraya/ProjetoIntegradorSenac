import { Router } from 'express';
import { SupermercadoController } from '../controllers/supermercadoController';
import { autenticar } from '../middleware/authMiddleware';

const router = Router();

const supermercadoController =
    new SupermercadoController();

router.post('/', SupermercadoController.criar);

router.get('/', SupermercadoController.listar);

router.get(
  '/meu-perfil',
  autenticar,
  SupermercadoController.meuPerfil.bind(
    SupermercadoController
  )
);

export default router;