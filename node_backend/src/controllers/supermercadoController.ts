import { Request, Response } from 'express';
import { SupermercadoService } from '../services/supermercadoService';

const supermercadoService = new SupermercadoService();

export class SupermercadoController {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const novoMercado = await supermercadoService.cadastrar(req.body);
      res.status(201).json({
        mensagem: 'Supermercado cadastrado com sucesso! 🏪',
        dados: novoMercado
      });
    } catch (error: any) {
      res.status(500).json({ erro: error.message || 'Erro ao cadastrar supermercado.' });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const mercados = await supermercadoService.listarTodos();
      res.status(200).json(mercados);
    } catch (error: any) {
      res.status(500).json({ erro: error.message || 'Erro ao listar supermercados.' });
    }
  }
}