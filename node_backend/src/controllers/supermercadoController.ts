import { Request, Response } from 'express';
import { SupermercadoService } from '../services/supermercadoService';
import { pool } from '../database';
import { logger } from '../utils/logger';


const supermercadoService = new SupermercadoService();

export class SupermercadoController {

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const novoMercado =
          await supermercadoService.cadastrar(req.body);

      res.status(201).json({
        mensagem: 'Supermercado cadastrado com sucesso! 🏪',
        dados: novoMercado
      });

    } catch (error: any) {
      res.status(500).json({
        erro: error.message
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const mercados =
          await supermercadoService.listarTodos();

      res.status(200).json(mercados);

    } catch (error: any) {
      res.status(500).json({
        erro: error.message
      });
    }
  }

  async meuPerfil(req: Request, res: Response): Promise<void> {
    try {

      if (!req.usuario) {
        res.status(401).json({
          erro: 'Usuário não autenticado'
        });
        return;
      }

      const idConta = req.usuario.id_conta;

      const resultado = await pool.query(
        `
        SELECT
          id_supermercado,

          nome_fantasia,

          telefone,
          email,

          cep,
          logradouro,
          numero,
          bairro,
          cidade,
          estado,
          pais,

          latitude,
          longitude,

          horario_semana_inicio,
          horario_semana_fim,

          horario_sabado_inicio,
          horario_sabado_fim,

          horario_domingo_inicio,
          horario_domingo_fim,

          horario_feriado_inicio,
          horario_feriado_fim,
          
          logo_url,
          capa_url
        FROM supermercado
        WHERE id_conta = $1
        `,
        [idConta]
      );

      if (resultado.rows.length === 0) {
        res.status(404).json({
          erro: 'Mercado não encontrado'
        });
        return;
      }

      res.status(200).json(resultado.rows[0]);

    } catch (error) {
      logger.error('❌ Erro ao buscar perfil do mercado:', error);

      res.status(500).json({
        erro: 'Erro ao buscar perfil do mercado'
      });
    }
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    console.log("🚀 MÉTODO ATUALIZAR CHAMADO! ID:", req.params.id);
    console.log("👤 USUÁRIO LOGADO:", req.usuario);
    const { id } = req.params;
    const {
      nome_fantasia,
      cnpj,
      email,
      telefone,
      cep,
      logradouro,
      numero,
      bairro,
      cidade,
      estado,
      pais,
      horario_semana_inicio,
      horario_semana_fim,
      horario_sabado_inicio,
      horario_sabado_fim,
      horario_domingo_inicio,
      horario_domingo_fim,
      horario_feriado_inicio,
      horario_feriado_fim,
    } = req.body;

    try {
      const resultado = await pool.query(
        `UPDATE supermercado 
         SET nome_fantasia = $1,
             cnpj = $2,
             email = $3,
             telefone = $4,
             cep = $5,
             logradouro = $6,
             numero = $7,
             bairro = $8,
             cidade = $9,
             estado = $10,
             pais = $11,
             horario_semana_inicio = $12,
             horario_semana_fim = $13,
             horario_sabado_inicio = $14,
             horario_sabado_fim = $15,
             horario_domingo_inicio = $16,
             horario_domingo_fim = $17,
             horario_feriado_inicio = $18,
             horario_feriado_fim = $19
         WHERE id_supermercado = $20 
         RETURNING *`,
        [
          nome_fantasia,
          cnpj,
          email,
          telefone,
          cep,
          logradouro,
          numero,
          bairro,
          cidade,
          estado,
          pais,
          horario_semana_inicio,
          horario_semana_fim,
          horario_sabado_inicio,
          horario_sabado_fim,
          horario_domingo_inicio,
          horario_domingo_fim,
          horario_feriado_inicio,
          horario_feriado_fim,
          id,
        ]
      );

      if (resultado.rows.length === 0) {
        res.status(404).json({ erro: 'Mercado não encontrado para atualização.' });
        return;
      }

      logger.info(`✅ Supermercado ID ${id} atualizado com sucesso.`);

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