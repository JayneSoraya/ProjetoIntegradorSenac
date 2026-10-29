"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apenasAdmin = void 0;
exports.autenticar = autenticar;
exports.autorizar = autorizar;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function readCookie(header, name) {
    if (!header)
        return '';
    for (const part of header.split(';')) {
        const [rawName, ...rawValue] = part.trim().split('=');
        if (rawName === name) {
            try {
                return decodeURIComponent(rawValue.join('='));
            }
            catch {
                return '';
            }
        }
    }
    return '';
}
function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length).trim()
        : '';
    const cookieToken = readCookie(req.headers.cookie, 'econoway_session');
    const token = bearerToken || cookieToken;
    if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido.' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret, {
            algorithms: ['HS256'],
            issuer: env_1.env.jwtIssuer,
            audience: env_1.env.jwtAudience,
        });
        if (!Number.isInteger(payload.id_conta) ||
            !payload.tipo_conta ||
            !['USUARIO', 'SUPERMERCADO', 'ADMIN'].includes(payload.tipo_conta)) {
            return res.status(401).json({ erro: 'Token inválido ou expirado.' });
        }
        req.auth = {
            accountId: payload.id_conta,
            userId: Number.isInteger(payload.id_usuario) ? payload.id_usuario : null,
            role: payload.tipo_conta,
        };
        req.usuario = {
            id_conta: payload.id_conta,
            id_usuario: payload.id_usuario ?? null,
            tipo_conta: payload.tipo_conta,
        };
        return next();
    }
    catch {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
}
function autorizar(...roles) {
    return (req, res, next) => {
        if (!req.auth) {
            return res.status(401).json({ erro: 'Autenticação obrigatória.' });
        }
        if (!roles.includes(req.auth.role)) {
            return res.status(403).json({ erro: 'Acesso não autorizado.' });
        }
        return next();
    };
}
exports.apenasAdmin = autorizar('ADMIN');
