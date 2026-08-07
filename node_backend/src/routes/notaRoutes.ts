import { Router } from "express";
import { processarNota } from '../controllers/nota.controller';
import { autenticar } from '../middleware/authMiddleware';

const router = Router();

router.post('/processar', autenticar, processarNota);
export default router;
