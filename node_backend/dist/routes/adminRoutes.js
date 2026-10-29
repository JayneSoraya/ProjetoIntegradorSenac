"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Todas as rotas admin exigem autenticação + ser ADMIN
router.use(authMiddleware_1.autenticar, authMiddleware_1.apenasAdmin);
// ── Mercados (RF21) ────────────────────────────────────────
router.get('/mercados', adminController_1.listarMercados);
router.post('/mercados', adminController_1.cadastrarMercado);
router.put('/mercados/:id', adminController_1.editarMercado);
router.delete('/mercados/:id', adminController_1.removerMercado);
// ── Usuários ───────────────────────────────────────────────
router.get('/usuarios', adminController_1.listarUsuarios);
router.patch('/usuarios/:id/bloquear', adminController_1.bloquearUsuario);
// ── Produtos ───────────────────────────────────────────────
router.get('/produtos', adminController_1.listarProdutosAdmin);
router.patch('/produtos/:id/categoria', adminController_1.corrigirCategoria);
exports.default = router;
