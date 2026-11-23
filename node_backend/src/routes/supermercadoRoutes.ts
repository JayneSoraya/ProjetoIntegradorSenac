import { Router } from 'express';
import { SupermercadoController } from '../controllers/supermercadoController';
import { autenticar, autorizar } from '../middleware/authMiddleware';
import { fixedWindowRateLimit } from '../middleware/securityMiddleware';

const router = Router();
const importRateLimit = fixedWindowRateLimit({ windowMs: 60 * 60 * 1000, max: 60, scope: 'account' });
const controller = new SupermercadoController();

router.use(autenticar);

router.get('/favoritos', autorizar('USUARIO'), controller.listarFavoritos);
router.get('/me', autorizar('SUPERMERCADO'), controller.meusMercados);
router.get('/', controller.listar);
router.post('/', autorizar('ADMIN'), controller.criar);

router.put('/:id/favorito', autorizar('USUARIO'), controller.adicionarFavorito);
router.delete('/:id/favorito', autorizar('USUARIO'), controller.removerFavorito);

router.get('/:id/produtos', autorizar('SUPERMERCADO', 'ADMIN'), controller.produtosOperacao);
router.get('/:id/inconsistencias', autorizar('SUPERMERCADO', 'ADMIN'), controller.inconsistencias);
router.put('/:id/produtos/:productId/preco', autorizar('SUPERMERCADO', 'ADMIN'), controller.atualizarPreco);
router.post('/:id/importacoes/validar', autorizar('SUPERMERCADO', 'ADMIN'), importRateLimit, controller.validarImportacao);
router.post('/:id/importacoes', autorizar('SUPERMERCADO', 'ADMIN'), importRateLimit, controller.aplicarImportacao);
router.get('/:id/importacoes', autorizar('SUPERMERCADO', 'ADMIN'), controller.historicoImportacoes);

export default router;
