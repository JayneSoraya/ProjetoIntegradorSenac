import { Request, Response } from 'express';
import { logger } from '../lib/logger';
import { ReceiptService } from '../services/receiptService';

export const processarNota = async (req: Request, res: Response) => {
  const { url_qrcode } = req.body ?? {};
  const userId = req.auth?.userId;

  if (!userId) return res.status(403).json({ erro: 'Envio de NFC-e disponível apenas para usuários.' });
  if (typeof url_qrcode !== 'string' || !url_qrcode.trim()) {
    return res.status(400).json({ erro: 'URL do QR code é obrigatória.' });
  }

  try {
    return res.status(200).json(await ReceiptService.process(userId, url_qrcode.trim()));
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'NFCE_DUPLICATE') {
      return res.status(409).json({ erro: 'Esta NFC-e já foi processada e não gera novos EconoCoins.' });
    }
    if (code === 'NFCE_CNPJ_INVALID') {
      return res.status(422).json({ erro: 'Não foi possível validar o CNPJ da nota.' });
    }
    if (code === 'NFCE_NO_ITEMS') {
      return res.status(422).json({ erro: 'Nenhum item válido foi encontrado na nota.' });
    }
    if (code.startsWith('NFCE_')) {
      return res.status(400).json({ erro: 'QR code de NFC-e inválido ou não permitido.' });
    }

    logger.error('nfce_processing_failed', error, { requestId: req.requestId, userId });
    return res.status(500).json({ erro: 'Erro ao processar a nota fiscal.' });
  }
};
