"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const progressoController_1 = require("../controllers/progressoController");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.autenticar, progressoController_1.buscarProgresso);
exports.default = router;
