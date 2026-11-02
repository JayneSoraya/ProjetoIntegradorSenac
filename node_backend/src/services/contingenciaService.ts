import { pool } from '../database';
import { processarNotaPorUrl } from './sefazService';
import { logger } from '../utils/logger';

export async function reprocessarNotasContingencia() {
  try {
    logger.info('🔄 Iniciando varredura automática de notas em CONTINGENCIA...');

    // Busca notas em contingência que possuem a URL original do QR Code guardada na chave_nfce
    const query = `
      SELECT id_nota, id_usuario, chave_nfce 
      FROM nota_fiscal 
      WHERE status = 'CONTINGENCIA' AND chave_nfce LIKE 'http%'
      LIMIT 10;
    `;
    const { rows: notas } = await pool.query(query);

    if (notas.length === 0) {
      logger.info('✨ Nenhuma nota em contingência para reprocessar no momento.');
      return;
    }

    for (const nota of notas) {
      try {
        logger.info(`🔍 Tentando reprocessar nota ID ${nota.id_nota}...`);
        
        // Reutilizamos a mesma função do service, passando a URL do QR Code, o usuário e o ID da nota existente
        await processarNotaPorUrl(nota.chave_nfce, nota.id_usuario, nota.id_nota);
        
        logger.info(`✅ Sucesso! Nota ID ${nota.id_nota} reprocessada e atualizada para PROCESSADA.`);
      } catch (err: any) {
        logger.warn(`⏳ SEFAZ indisponível para a nota ID ${nota.id_nota}. Mantida em contingência. Detalhe: ${err.message}`);
      }
    }
  } catch (error) {
    logger.error('❌ Erro crítico na rotina de background de contingência:', error);
  }
}