import { pool } from '../database';
import { processarNotaPorUrl } from './sefazService';
import { logger } from '../utils/logger';

export interface NotaContingenciaDTO {
  id_nota: number;
  id_usuario: number;
  chave_nfce: string;
}

export async function reprocessarNotasContingencia(): Promise<void> {
  try {
    logger.info('🔄 Iniciando varredura automática de notas em CONTINGENCIA...');

    const query = `
      SELECT id_nota, id_usuario, chave_nfce 
      FROM nota_fiscal 
      WHERE status = 'CONTINGENCIA' AND chave_nfce LIKE 'http%'
      LIMIT 10;
    `;
    const { rows: notas } = await pool.query<NotaContingenciaDTO>(query);

    if (notas.length === 0) {
      logger.info('✨ Nenhuma nota em contingência para reprocessar no momento.');
      return;
    }

    for (const nota of notas) {
      try {
        logger.info(`🔍 Tentando reprocessar nota ID ${nota.id_nota}...`);
        await processarNotaPorUrl(nota.chave_nfce, nota.id_usuario, nota.id_nota);
        logger.info(`✅ Sucesso! Nota ID ${nota.id_nota} reprocessada e atualizada para PROCESSADA.`);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        logger.warn(`⏳ SEFAZ indisponível para a nota ID ${nota.id_nota}. Mantida em contingência. Detalhe: ${errorMessage}`);
      }
    }
  } catch (error) {
    logger.error('❌ Erro crítico na rotina de background de contingência:', error);
  }
}