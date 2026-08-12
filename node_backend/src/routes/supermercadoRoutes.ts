import { Router } from 'express';
import { SupermercadoController } from '../controllers/supermercadoController';
import { autenticar } from '../middleware/authMiddleware';

const router = Router();

const supermercadoController =
    new SupermercadoController();

router.post('/', supermercadoController.criar);

router.get('/', supermercadoController.listar);

router.get(
  '/meu-perfil',
  autenticar,
  supermercadoController.meuPerfil.bind(
    supermercadoController
  )
);

export default router;