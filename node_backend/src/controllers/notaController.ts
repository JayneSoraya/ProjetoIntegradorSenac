import { Request, Response } from 'express';
import { NotaService } from '../services/notaService';
import { logger } from '../utils/logger';

export const processarNota = async (req: Request, res: Response) => {
  const { url_qrcode } = req.body;

  if (!url_qrcode) {
    return res.status(400).json({ erro: 'URL do QR code é obrigatória.' });
  }

  if (!req.usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  try {
    const resultado = await NotaService.processarQrCode(url_qrcode, req.usuario.id_usuario);

    // Verificação de tipo segura para o TypeScript reconhecer o objeto de contingência
    if ('contingencia' in resultado && resultado.contingencia) {
      return res.status(201).json({
        sucesso: true,
        contingencia: true,
        mensagem: 'Nota salva em modo de contingência! O valor foi computado no seu orçamento e os produtos serão detalhados assim que a SEFAZ atualizar.',
        valor_total: resultado.valor_total,
        chave_nfce: resultado.chave_nfce,
      });
    }

    return res.status(200).json({
      mensagem: 'Nota processada com sucesso!',
      ...resultado,
    });
  } catch (erro: any) {
    if (erro.message === 'DADOS_QRCODE_INVALIDOS') {
      return res.status(422).json({
        erro: 'Não foi possível ler os dados do QR Code da nota.',
      });
    }

    logger.error(`❌ Erro ao processar e salvar a nota fiscal: ${erro.message}`);
    return res.status(500).json({
      erro: 'Erro ao processar e salvar a nota fiscal.',
      detalhe: erro.message,
    });
  }
};

export const importarHtmlSefaz = async (req: Request, res: Response) => {
  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const idNota = idParam ? parseInt(idParam, 10) : NaN;

  const { html } = req.body;
  const idUsuario = req.usuario?.id_usuario;

  if (!idUsuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  if (isNaN(idNota)) {
    return res.status(400).json({ erro: 'ID da nota fiscal inválido.' });
  }

  if (!html) {
    return res.status(400).json({ erro: 'Nenhum conteúdo HTML foi fornecido.' });
  }

  try {
    const resultado = await NotaService.importarHtml(html, idUsuario, idNota);

    logger.info(`📝 Nota ID ${idNota} sincronizada manualmente via HTML do WebView pelo usuário ${idUsuario}`);

    return res.status(200).json({
      ...resultado,
      sucesso: true,
      mensagem: 'Nota sincronizada e produtos importados com sucesso!',
    });
  } catch (erro: any) {
    if (erro.message === 'NOTA_NAO_ENCONTRADA') {
      return res.status(404).json({ erro: 'Nota fiscal não encontrada.' });
    }

    logger.error(`❌ Erro ao processar HTML manual da nota ID ${idNota}: ${erro.message}`);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno ao salvar os dados da nota.',
      detalhe: erro.message,
    });
  }
};