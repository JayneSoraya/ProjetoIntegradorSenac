import { Request, Response } from 'express';
import { SupermercadoService } from '../services/supermercadoService';
import { pool } from '../database';


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
      console.error(error);

      res.status(500).json({
        erro: 'Erro ao buscar perfil do mercado'
      });
    }
  }
}