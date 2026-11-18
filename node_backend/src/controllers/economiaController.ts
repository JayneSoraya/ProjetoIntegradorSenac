import { Request, Response }
from 'express';

import { EconomiaService }
from '../services/economiaService';

import { logger }
from '../utils/logger';

export const buscarResumo =
  async (
    req: Request,
    res: Response,
  ) => {

    const { id_conta } =
      req.usuario!;

    try {

      const resumo =
        await EconomiaService
          .buscarResumo(
            id_conta,
          );

      return res
        .status(200)
        .json(resumo);

    } catch (erro) {

      logger.error(
        `Erro ao buscar resumo: ${
          erro instanceof Error
            ? erro.message
            : String(erro)
        }`,
      );

      return res.status(500).json({
        erro:
          'Erro ao buscar dados.',
      });
    }
  };