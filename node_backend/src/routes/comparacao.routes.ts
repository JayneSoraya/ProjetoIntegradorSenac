import { Router } from 'express';

import { autenticar } from '../middleware/authMiddleware';

import { ComparacaoController } from '../controllers/comparacao.controller';


const router = Router();



const controller = new ComparacaoController();

router.post(
    '/', autenticar, controller.comparar,
);

export default router;