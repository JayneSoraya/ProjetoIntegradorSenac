"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
exports.pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        logger_1.logger.error('❌ Erro ao conectar no banco de dados Neon:', err.stack);
    }
    else {
        logger_1.logger.info('✅ Conexão com o banco Neon estabelecida com sucesso em:', res.rows[0].now);
    }
});
