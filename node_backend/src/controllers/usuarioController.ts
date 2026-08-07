import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuarioService';

const usuarioService = new UsuarioService();

export class UsuarioController {
  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await usuarioService.cadastrar(req.body);
      res.status(201).json({
        mensagem: 'Usuário registrado com sucesso! 🚀',
        dados: resultado
      });
    } catch (error: any) {
      if (error.code === '23505') { 
        res.status(400).json({ erro: 'Este e-mail já está cadastrado no sistema.' });
        return;
      }
      res.status(500).json({ erro: 'Erro interno ao processar o cadastro.' });
    }
  }
}