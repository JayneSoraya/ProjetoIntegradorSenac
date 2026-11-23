import { Router } from 'express';
import {
  alterarStatusConta,
  alterarStatusSupermercado,
  listarAuditoria,
  listarSupermercadosAdmin,
  listarUsuarios,
  resumoAdmin,
} from '../controllers/adminController';
import { autenticar, autorizar } from '../middleware/authMiddleware';

const router = Router();

router.use(autenticar, autorizar('ADMIN'));
router.get('/resumo', resumoAdmin);
router.get('/usuarios', listarUsuarios);
router.patch('/usuarios/:id/status', alterarStatusConta);
router.get('/supermercados', listarSupermercadosAdmin);
router.patch('/supermercados/:id/status', alterarStatusSupermercado);
router.get('/auditoria', listarAuditoria);

export default router;
