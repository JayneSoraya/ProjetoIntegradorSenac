import {
  Request,
  Response,
} from 'express';

import { logger }
from '../utils/logger';

import { ProgressoService }
from '../services/progressoService';

export const buscarProgresso =
  async (
    req: Request,
    res: Response,
  ) => {

    if (!req.usuario) {

      return res.status(401).json({
        erro:
          'Usuário não autenticado.',
      });
    }

    try {

      const resultado =
        await ProgressoService
          .buscarResumo(
            req.usuario.id_usuario,
          );

      return res.status(200).json(
        resultado,
      );

    } catch (erro) {

      logger.error(
        `Erro ao buscar progresso: ${
          erro instanceof Error
            ? erro.message
            : String(erro)
        }`,
      );

      return res.status(500).json({
        erro:
          'Erro ao buscar progresso.',
      });
    }
  };