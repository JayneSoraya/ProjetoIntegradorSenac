import {
  processarNotaPorUrl,
  processarHtmlSefazManual,
} from './sefazService';
import { NotaRepository } from '../repositories/notaRepository';
import { logger } from '../utils/logger';

export class NotaService {
  static async processarQrCode(urlQrCode: string, idUsuario: number) {
    try {
      return await processarNotaPorUrl(urlQrCode, idUsuario);
    } catch (erro: any) {
      logger.warn(`⚠️ Falha no scraping da SEFAZ (Contingência acionada): ${erro.message}`);

      let chaveNfceFallback = '';
      let valorTotalFallback = 0;
      let cnpjFallback = '';

      try {
        const urlObj = new URL(urlQrCode);
        const pParam = urlObj.searchParams.get('p');
        if (pParam) {
          const partes = pParam.split('|');
          chaveNfceFallback = partes[0] || '';
          valorTotalFallback = partes[4] ? parseFloat(partes[4]) : 0;
          if (chaveNfceFallback.length >= 20) {
            cnpjFallback = chaveNfceFallback.substring(6, 20);
          }
        }
      } catch {
        // Ignora erro de parsing
      }

      if (!chaveNfceFallback || valorTotalFallback <= 0) {
        throw new Error('DADOS_QRCODE_INVALIDOS');
      }

      let idSupermercado = null;
      if (cnpjFallback) {
        const sup = await NotaRepository.buscarSupermercadoPorCnpj(cnpjFallback);
        if (sup.rows.length > 0) {
          idSupermercado = sup.rows[0].id_supermercado;
        } else {
          const novoSup = await NotaRepository.criarSupermercadoContingencia(cnpjFallback);
          idSupermercado = novoSup.rows[0].id_supermercado;
        }
      }

      await NotaRepository.salvarNotaContingencia(
        idUsuario,
        idSupermercado,
        valorTotalFallback,
        urlQrCode
      );

      return {
        contingencia: true,
        valor_total: valorTotalFallback,
        chave_nfce: chaveNfceFallback,
      };
    }
  }

  static async importarHtml(html: string, idUsuario: number, idNota: number) {
    const notaCheck = await NotaRepository.buscarNotaUsuario(idNota, idUsuario);

    if (notaCheck.rows.length === 0) {
      throw new Error('NOTA_NAO_ENCONTRADA');
    }

    return processarHtmlSefazManual(html, idUsuario, idNota);
  }
}