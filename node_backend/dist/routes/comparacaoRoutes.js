"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const comparacaoController_1 = require("../controllers/comparacaoController");
const router = (0, express_1.Router)();
const controller = new comparacaoController_1.ComparacaoController();
router.post('/', authMiddleware_1.autenticar, controller.comparar);
exports.default = router;
