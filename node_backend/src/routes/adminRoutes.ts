import { Router } from 'express';
import { autenticar, apenasAdmin } from '../middleware/authMiddleware';
import {
  listarMercados,
  cadastrarMercado,
  editarMercado,
  removerMercado,
  listarUsuarios,
  bloquearUsuario,
  listarProdutosAdmin,
  atualizarProdutoAdmin,
} from '../controllers/adminController';

const router = Router();

router.use(autenticar, apenasAdmin);

// ── Mercados (RF21) ────────────────────────────────────────
router.get('/mercados',          listarMercados);
router.post('/mercados',         cadastrarMercado);
router.put('/mercados/:id',      editarMercado);
router.delete('/mercados/:id',   removerMercado);

// ── Usuários ───────────────────────────────────────────────
router.get('/usuarios',                    listarUsuarios);
router.patch('/usuarios/:id/bloquear',     bloquearUsuario);

// ── Produtos ───────────────────────────────────────────────
router.get('/produtos',                      listarProdutosAdmin);
router.patch('/produtos/:id',              atualizarProdutoAdmin );

export default router;