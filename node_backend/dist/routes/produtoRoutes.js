"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const produtoController_1 = require("../controllers/produtoController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const controller = new produtoController_1.ProdutoController();
// RF05 — buscar produtos 
router.get('/', authMiddleware_1.autenticar, controller.buscar);
// RF07 — detalhe do produto 
router.get('/:id', authMiddleware_1.autenticar, controller.buscarDetalhe);
exports.default = router;
