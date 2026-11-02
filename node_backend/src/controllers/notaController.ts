import { Request, Response } from 'express';
import { processarNotaPorUrl, processarHtmlSefazManual } from '../services/sefazService';
import { pool } from '../database';
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
    const resultado = await processarNotaPorUrl(url_qrcode, req.usuario.id_usuario);
    return res.status(200).json({
      mensagem: 'Nota processada com sucesso!',
      ...resultado
    });
  } catch (erro: any) {
    logger.warn(`⚠️ Falha no scraping da SEFAZ (Contingência acionada): ${erro.message}`);

    let chaveNfceFallback = '';
    let valorTotalFallback = 0;
    let cnpjFallback = '';

    try {
      const urlObj = new URL(url_qrcode);
      const pParam = urlObj.searchParams.get('p');
      if (pParam) {
        const partes = pParam.split('|');
        chaveNfceFallback = partes[0] || '';
        valorTotalFallback = partes[4] ? parseFloat(partes[4]) : 0;
        if (chaveNfceFallback.length >= 20) {
          cnpjFallback = chaveNfceFallback.substring(6, 20);
        }
      }
    } catch (e) {
      // Ignora erro de parsing
    }

    if (!chaveNfceFallback || valorTotalFallback <= 0) {
      return res.status(422).json({
        erro: 'Não foi possível ler os dados do QR Code da nota.',
        detalhe: erro.message,
      });
    }

    try {
      let idSupermercado = null;
      if (cnpjFallback) {
        let sup = await pool.query('SELECT id_supermercado FROM supermercado WHERE cnpj = $1', [cnpjFallback]);
        if (sup.rows.length > 0) {
          idSupermercado = sup.rows[0].id_supermercado;
        } else {
          let novoSup = await pool.query(
            `INSERT INTO supermercado (cnpj, nome_fantasia, endereco_completo) VALUES ($1, $2, $3) RETURNING id_supermercado`,
            [cnpjFallback, 'Estabelecimento em Contingência', 'Endereço não disponível']
          );
          idSupermercado = novoSup.rows[0].id_supermercado;
        }
      }

      await pool.query(
        `INSERT INTO nota_fiscal (id_usuario, id_supermercado, data_compra, valor_total, chave_nfce, status) 
         VALUES ($1, $2, NOW(), $3, $4, 'CONTINGENCIA')`,
        [req.usuario.id_usuario, idSupermercado, valorTotalFallback, url_qrcode]
      );

      return res.status(201).json({
        sucesso: true,
        contingencia: true,
        mensagem: 'Nota salva em modo de contingência! O valor foi computado no seu orçamento e os produtos serão detalhados assim que a SEFAZ atualizar.',
        valor_total: valorTotalFallback,
        chave_nfce: chaveNfceFallback
      });

    } catch (dbError: any) {
      logger.error(`❌ Erro ao salvar nota em contingência no banco: ${dbError.message}`);
      return res.status(500).json({
        erro: 'Erro ao processar e salvar a nota fiscal.',
        detalhe: dbError.message,
      });
    }
  }
};

export const importarHtmlSefaz = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { html } = req.body;
  const idUsuario = req.usuario?.id_usuario;

  if (!idUsuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  if (!html) {
    return res.status(400).json({ erro: 'Nenhum conteúdo HTML foi fornecido.' });
  }

  try {
    // 1. Confirma que a nota pertence ao usuário logado
    const notaCheck = await pool.query(
      `SELECT id_nota, status FROM nota_fiscal WHERE id_nota = $1 AND id_usuario = $2`,
      [id, idUsuario]
    );

    if (notaCheck.rows.length === 0) {
      return res.status(404).json({ erro: 'Nota fiscal não encontrada.' });
    }

    // 2. Processa o HTML manualmente
    const resultado = await processarHtmlSefazManual(html, idUsuario, Number(id));

    logger.info(`✅ Nota ID ${id} sincronizada manualmente via HTML do WebView pelo usuário ${idUsuario}`);

    return res.status(200).json({
      ...resultado,
      sucesso: true,
      mensagem: 'Nota sincronizada e produtos importados com sucesso!',
    });

  } catch (erro: any) {
    logger.error(`❌ Erro ao processar HTML manual da nota ID ${id}: ${erro.message}`);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno ao salvar os dados da nota.',
      detalhe: erro.message,
    });
  }
};