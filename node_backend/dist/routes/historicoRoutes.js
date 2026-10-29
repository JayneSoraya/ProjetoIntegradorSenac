"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const historicoController_1 = require("../controllers/historicoController");
const router = (0, express_1.Router)();
// Todas protegidas por JWT
router.use(authMiddleware_1.autenticar);
// Histórico de compras do usuário
router.get('/compras', historicoController_1.listarCompras);
router.get('/compras/:id', historicoController_1.detalheCompra);
// Histórico de preço de um produto
router.get('/precos/:id_produto', historicoController_1.historicoPrecoProduto);
// Resumo de economia (HomeScreen)
router.get('/resumo', historicoController_1.resumoEconomia);
exports.default = router;
