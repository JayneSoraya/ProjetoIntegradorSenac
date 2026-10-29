"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notaController_1 = require("../controllers/notaController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/processar', authMiddleware_1.autenticar, notaController_1.processarNota);
exports.default = router;
