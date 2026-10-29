"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUsuario = exports.cadastrarUsuario = void 0;
const usuarioService_1 = require("../services/usuarioService");
const logger_1 = require("../utils/logger");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('FATAL: JWT_SECRET não configurado.');
}
const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({
            erro: 'Campos obrigatórios: nome, email e senha.',
        });
    }
    try {
        await usuarioService_1.UsuarioService.cadastrar({ nome, email, senha });
        return res.status(201).json({
            status: 'sucesso',
            mensagem: 'Usuário cadastrado com sucesso!',
        });
    }
    catch (erro) {
        logger_1.logger.error('❌ ERRO CADASTRO:', { erro: erro.message });
        if (erro.message === 'Este e-mail já está cadastrado.') {
            return res.status(409).json({ erro: erro.message });
        }
        return res.status(500).json({
            erro: erro.message || 'Erro interno no cadastro',
        });
    }
};
exports.cadastrarUsuario = cadastrarUsuario;
const loginUsuario = async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({
            erro: 'Email e senha são obrigatórios.',
        });
    }
    try {
        const usuario = await usuarioService_1.UsuarioService.autenticar(email, senha);
        if (!usuario) {
            return res.status(401).json({
                erro: 'Usuário não encontrado ou senha inválida',
            });
        }
        const token = jsonwebtoken_1.default.sign({
            id_conta: usuario.id_conta,
            id_usuario: usuario.id_usuario,
            tipo_conta: usuario.tipo_conta,
        }, jwtSecret, {
            expiresIn: '7d',
        });
        return res.json({
            status: 'sucesso',
            usuario: {
                id_conta: usuario.id_conta,
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                tipo_conta: usuario.tipo_conta,
            },
            token,
        });
    }
    catch (erro) {
        logger_1.logger.error('❌ ERRO LOGIN:', { erro: erro.message });
        if (erro.message === 'Senha inválida' || erro.message === 'Usuário não encontrado') {
            return res.status(401).json({ erro: erro.message });
        }
        return res.status(500).json({
            erro: 'Erro interno no login',
        });
    }
};
exports.loginUsuario = loginUsuario;
