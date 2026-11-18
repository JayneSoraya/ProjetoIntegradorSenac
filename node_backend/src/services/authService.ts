import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/authRepository';

export class AuthService {
  static async cadastrarUsuario(dados: {
    nome?: string;
    email?: string;
    senha?: string;
  }) {
    const { nome, email, senha } = dados;

    if (!nome || !email || !senha) {
      throw new Error('CAMPOS_OBRIGATORIOS');
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await AuthRepository.criarUsuarioComTransacao({
      email,
      senhaCriptografada,
      nome,
    });

    return {
      status: 'sucesso',
      mensagem: 'Usuário cadastrado com sucesso!',
    };
  }

  static async loginUsuario(dados: { email?: string; senha?: string }) {
    const { email, senha } = dados;

    if (!email || !senha) {
      throw new Error('CREDENCIAIS_OBRIGATORIAS');
    }

    const result = await AuthRepository.buscarDadosLoginPorEmail(email);

    if (result.rows.length === 0) {
      throw new Error('USUARIO_NAO_ENCONTRADO');
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new Error('SENHA_INVALIDA');
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET não configurado');
    }

    const token = jwt.sign(
      {
        id_conta: usuario.id_conta,
        id_usuario: usuario.id_usuario,
        tipo_conta: usuario.tipo_conta,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    return {
      status: 'sucesso',
      usuario: {
        id_conta: usuario.id_conta,
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        tipo_conta: usuario.tipo_conta,
      },
      token,
    };
  }
}