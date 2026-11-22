import { Router } from 'express';
import { autenticar, apenasAdmin } from '../middleware/authMiddleware';
import { apiLimiter, criticoLimiter } from '../middleware/rateLimitMiddleware';
import {
  listarMercados,
  cadastrarMercado,
  editarMercado,
  removerMercado,
  listarUsuarios,
  bloquearUsuario,
  listarProdutosAdmin,
  atualizarProdutoAdmin,
  removerProdutoAdmin,
} from '../controllers/adminController';

const router = Router();

// Aplica o limitador
router.use(apiLimiter, autenticar, apenasAdmin);

// ── Mercados (RF21) ────────────────────────────────────────
router.get('/mercados',          listarMercados);
router.post('/mercados',         cadastrarMercado);
router.put('/mercados/:id',      editarMercado);
router.delete('/mercados/:id',   criticoLimiter, removerMercado);

// ── Usuários ───────────────────────────────────────────────
router.get('/usuarios',                    listarUsuarios);
router.patch('/usuarios/:id/bloquear',     criticoLimiter, bloquearUsuario);

// ── Produtos (RF30 / RF47) ─────────────────────────────────
router.get('/produtos',          listarProdutosAdmin);
router.put('/produtos/:id',      atualizarProdutoAdmin);
router.delete('/produtos/:id',   criticoLimiter, removerProdutoAdmin);

export default router;