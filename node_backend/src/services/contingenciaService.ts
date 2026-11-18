import { ContingenciaRepository } from '../repositories/contingenciaRepository';
import { processarNotaPorUrl } from './sefazService';
import { logger } from '../utils/logger';

export interface NotaContingenciaDTO {
  id_nota: number;
  id_usuario: number;
  chave_nfce: string;
}

// Função exportada para o Cron Job e rota de reprocessamento no server.ts
export async function reprocessarNotasContingencia(): Promise<void> {
  try {
    logger.info('🔄 Iniciando varredura automática de notas em CONTINGENCIA...');

    const resultado = await ContingenciaRepository.buscarNotasContingencia();
    const notas = resultado.rows as NotaContingenciaDTO[];

    if (notas.length === 0) {
      logger.info('ℹ️ Nenhuma nota em contingência para reprocessar no momento.');
      return;
    }

    for (const nota of notas) {
      try {
        logger.info(`🔄 Tentando reprocessar nota ID ${nota.id_nota}...`);
        await processarNotaPorUrl(nota.chave_nfce, nota.id_usuario, nota.id_nota);
        logger.info(`✅ Sucesso! Nota ID ${nota.id_nota} reprocessada e atualizada para PROCESSADA.`);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        logger.warn(`⚠️ SEFAZ indisponível para a nota ID ${nota.id_nota}. Mantida em contingência. Detalhe: ${errorMessage}`);
      }
    }
  } catch (error) {
    logger.error('❌ Erro crítico na rotina de background de contingência:', error);
  }
}

export class ContingenciaService {
  static async sincronizarNotaManual(idNota: string, idUsuario: number) {
    const result = await ContingenciaRepository.buscarNotaPorIdEUsuario(idNota, idUsuario);

    if (result.rows.length === 0) {
      throw new Error('NOTA_NAO_ENCONTRADA');
    }

    const nota = result.rows[0];

    if (nota.status !== 'CONTINGENCIA') {
      throw new Error('NOTA_JA_PROCESSADA');
    }

    const resultado = await processarNotaPorUrl(nota.chave_nfce, idUsuario, Number(nota.id_nota));

    logger.info(`✅ Nota ID ${idNota} sincronizada manualmente com sucesso pelo usuário ${idUsuario}`);

    return {
      ...resultado,
      sucesso: true,
      mensagem: 'Nota sincronizada com sucesso!',
    };
  }
}