import { Request, Response } from 'express';
import { SupermercadoService } from '../services/supermercadoService';
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

 static async meuPerfil(
  req: Request,
  res: Response,
): Promise<void> {

  try {

    if (!req.usuario) {
      res.status(401).json({
        erro: 'Usuário não autenticado',
      });
      return;
    }

    const mercado =
      await SupermercadoService
        .buscarPerfil(
          req.usuario.id_conta,
        );

    if (!mercado) {
      res.status(404).json({
        erro: 'Mercado não encontrado',
      });
      return;
    }

    res.status(200).json(
      mercado,
    );

  } catch (error) {

    logger.error(
      'Erro ao buscar perfil do mercado',
      error,
    );

    res.status(500).json({
      erro:
        'Erro ao buscar perfil do mercado',
    });
  }
}

  static async atualizar(
  req: Request,
  res: Response,
): Promise<void> {

  const { id } = req.params;

  try {

    const mercado =
      await SupermercadoService
        .atualizarPerfil(
          Number(id),
          req.body,
        );

    if (!mercado) {

      res.status(404).json({
        erro:
          'Mercado não encontrado para atualização.',
      });

      return;
    }

    logger.info(
      `Mercado ${id} atualizado com sucesso.`,
    );

    res.status(200).json({
      sucesso: true,
      mensagem:
        'Mercado atualizado com sucesso!',
      dados: mercado,
    });

  } catch (error: any) {

    logger.error(
      `Erro ao atualizar mercado ${id}: ${error.message}`,
    );

    res.status(500).json({
      erro:
        'Erro interno ao atualizar o mercado.',
    });
  }
}
}