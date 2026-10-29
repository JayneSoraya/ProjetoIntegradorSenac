"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
require("./database");
const notaRoutes_1 = __importDefault(require("./routes/notaRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const supermercadoRoutes_1 = __importDefault(require("./routes/supermercadoRoutes"));
const produtoRoutes_1 = __importDefault(require("./routes/produtoRoutes"));
const comparacaoRoutes_1 = __importDefault(require("./routes/comparacaoRoutes"));
const historicoRoutes_1 = __importDefault(require("./routes/historicoRoutes"));
const progressoRoutes_1 = __importDefault(require("./routes/progressoRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3333;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 requisições por IP
    message: 'Muitas requisições feitas a partir deste IP, por favor tente novamente mais tarde.',
});
//  Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(limiter);
app.use('/api/notas', notaRoutes_1.default);
app.use('/api/comparacao', comparacaoRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/historico', historicoRoutes_1.default);
app.use('/api/supermercados', supermercadoRoutes_1.default);
app.use('/api/progresso', progressoRoutes_1.default);
const logger_1 = require("./utils/logger");
// ROTA DE TESTE 
app.get('/api/status', (req, res) => {
    logger_1.logger.info("📱 Celular conectou na API ");
    res.json({
        status: "online",
        mensagem: "API SaveMoneyfuncionando!"
    });
});
// ROTAS PRINCIPAIS
app.use('/api/auth', authRoutes_1.default);
app.use('/api/supermercados', supermercadoRoutes_1.default);
app.use('/api/produtos', produtoRoutes_1.default);
// INICIAR SERVIDOR (aceita celular)
app.listen(Number(PORT), '0.0.0.0', () => {
    logger_1.logger.info(`🚀 SaveMoney API rodando na porta ${PORT}`);
});
