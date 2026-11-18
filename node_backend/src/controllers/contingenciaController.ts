import { Request, Response } from 'express';
import { ContingenciaService } from '../services/contingenciaService';
import { logger } from '../utils/logger';

export const sincronizarNotaContingencia = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const idUsuario = req.usuario?.id_usuario;

  if (!idUsuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  if (!id) {
    return res.status(400).json({ erro: 'ID da nota não fornecido.' });
  }

  try {
    const resposta = await ContingenciaService.sincronizarNotaManual(id, idUsuario);
    return res.status(200).json(resposta);
  } catch (erro: any) {
    if (erro.message === 'NOTA_NAO_ENCONTRADA') {
      return res.status(404).json({ erro: 'Nota fiscal não encontrada.' });
    }

    if (erro.message === 'NOTA_JA_PROCESSADA') {
      return res.status(400).json({ mensagem: 'Esta nota já foi processada.' });
    }

    logger.warn(`⚠️ Erro na sincronização manual: ${erro.message}`);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno ao tentar sincronizar com a SEFAZ.',
      detalhe: erro.message,
    });
  }
};