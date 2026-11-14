import { Request, Response } from 'express';
import { SupermercadoService } from '../services/supermercadoService';
import { pool } from '../database';
import { logger } from '../utils/logger';

export class SupermercadoController {

  static async criar(req: Request, res: Response): Promise<void> {
    try {
      const novoMercado = await SupermercadoService.cadastrar(req.body);

      res.status(201).json({
        mensagem: 'Supermercado cadastrado com sucesso! 🚀',
        dados: novoMercado
      });

    } catch (error: any) {
      res.status(500).json({
        erro: error.message
      });
    }
  }

  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const mercados = await SupermercadoService.listarTodos();

      res.status(200).json(mercados);

    } catch (error: any) {
      res.status(500).json({
        erro: error.message
      });
    }
  }

  static async meuPerfil(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }

      const idConta = req.usuario.id_conta;

      const resultado = await pool.query(
        `SELECT id_supermercado, nome_fantasia, telefone, email, cep, logradouro, 
                numero, bairro, cidade, estado, pais, latitude, longitude, logo_url, capa_url 
         FROM supermercado WHERE id_conta = $1`,
        [idConta]
      );

      if (resultado.rows.length === 0) {
        res.status(404).json({ erro: 'Mercado não encontrado' });
        return;
      }

      res.status(200).json(resultado.rows[0]);

    } catch (error) {
      logger.error('❌ Erro ao buscar perfil do mercado:', error);
      res.status(500).json({ erro: 'Erro ao buscar perfil do mercado' });
    }
  }

  static async atualizar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dados = req.body;

    try {
      const resultado = await pool.query(
        `UPDATE supermercado 
         SET nome_fantasia = $1, cnpj = $2, email = $3, telefone = $4, cep = $5,
             logradouro = $6, numero = $7, bairro = $8, cidade = $9, estado = $10, pais = $11
         WHERE id_supermercado = $12 
         RETURNING *`,
        [
          dados.nome_fantasia, dados.cnpj, dados.email, dados.telefone, dados.cep,
          dados.logradouro, dados.numero, dados.bairro, dados.cidade, dados.estado, dados.pais,
          id,
        ]
      );

      if (resultado.rows.length === 0) {
        res.status(404).json({ erro: 'Mercado não encontrado para atualização.' });
        return;
      }

      logger.info(`📝 Supermercado ID ${id} atualizado com sucesso.`);

      res.status(200).json({
        sucesso: true,
        mensagem: 'Mercado atualizado com sucesso!',
        dados: resultado.rows[0],
      });

    } catch (error: any) {
      logger.error(`❌ Erro ao atualizar supermercado ID ${id}:`, error);
      res.status(500).json({
        erro: 'Erro interno ao atualizar o mercado.',
        detalhe: error.message,
      });
    }
  }
}