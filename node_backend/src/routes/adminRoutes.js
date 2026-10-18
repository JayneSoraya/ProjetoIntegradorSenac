import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { autenticar, apenasAdmin } from '../middleware/authMiddleware';
import { listarMercados, cadastrarMercado, editarMercado, removerMercado, listarUsuarios, bloquearUsuario, listarProdutosAdmin, corrigirCategoria, } from '../controllers/adminController';
const router = Router();
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5,
    message: 'Muitas requisições feitas a partir deste IP, por favor tente novamente mais tarde.',
});
router.use(adminLimiter);
// Todas as rotas admin exigem autenticação + ser ADMIN
router.use(autenticar, apenasAdmin);
// ── Mercados (RF21) ────────────────────────────────────────
router.get('/mercados', listarMercados);
router.post('/mercados', cadastrarMercado);
router.put('/mercados/:id', editarMercado);
router.delete('/mercados/:id', removerMercado);
// ── Usuários ───────────────────────────────────────────────
router.get('/usuarios', listarUsuarios);
router.patch('/usuarios/:id/bloquear', bloquearUsuario);
// ── Produtos ───────────────────────────────────────────────
router.get('/produtos', listarProdutosAdmin);
router.patch('/produtos/:id/categoria', corrigirCategoria);
export default router;
