import { Request, Response } from 'express';
import { pool } from '../database';
import { processarNotaPorUrl } from '../services/sefazService';
import { logger } from '../utils/logger';


export const sincronizarNotaContingencia = async (req: Request, res: Response) => {
  const { id } = req.params;
  const idUsuario = req.usuario?.id_usuario;

  if (!idUsuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  try {
    // 1. Busca a nota no banco para verificar se pertence ao usuário e se está em CONTINGENCIA
    const result = await pool.query(
      `SELECT id_nota, chave_nfce, status 
       FROM nota_fiscal 
       WHERE id_nota = $1 AND id_usuario = $2`,
      [id, idUsuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Nota fiscal não encontrada.' });
    }

    const nota = result.rows[0];

    if (nota.status !== 'CONTINGENCIA') {
      return res.status(400).json({ mensagem: 'Esta nota já foi processada.' });
    }

    // 2. Tenta reprocessar o scraping na SEFAZ usando a URL salva na chave_nfce
    const resultado = await processarNotaPorUrl(nota.chave_nfce, idUsuario, nota.id_nota);

    logger.info(`✅ Nota ID ${id} sincronizada manualmente com sucesso pelo usuário ${idUsuario}`);

    return res.status(200).json({
  ...resultado,
  sucesso: true,
  mensagem: 'Nota sincronizada com sucesso!',
});
  } catch (erro: any) {
  logger.warn(`⚠️ Erro na sincronização manual: ${erro.message}`);
  return res.status(500).json({
    sucesso: false,
    erro: 'Erro interno ao tentar sincronizar com a SEFAZ.',
    detalhe: erro.message,
  });
}
};