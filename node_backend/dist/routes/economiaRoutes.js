"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const economiaController_1 = require("../controllers/economiaController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/resumo', authMiddleware_1.autenticar, economiaController_1.buscarResumo);
exports.default = router;
