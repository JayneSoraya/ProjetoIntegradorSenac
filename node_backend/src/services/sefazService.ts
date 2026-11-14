import axios from 'axios';
import * as cheerio from 'cheerio';
import type { PoolClient } from 'pg';
import { pool } from '../database';
import { logger } from '../utils/logger';
import { ProdutoService } from './produtoService';
import { parseMoeda, parseDataSefaz, validarUrlSefaz } from '../utils/parserUtils';

type ItemNota = {
  nome: string;
  codigoBarras: string | null;
  preco: number;
  quantidade: number;
  unidade: string;
};

async function comTransacao<T>(
  operacao: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  let transacaoIniciada = false;

  try {
    await client.query('BEGIN');
    transacaoIniciada = true;

    const resultado = await operacao(client);

    await client.query('COMMIT');
    transacaoIniciada = false;

    return resultado;
  } catch (erro) {
    if (transacaoIniciada) {
      try {
        await client.query('ROLLBACK');
      } catch (erroRollback) {
        logger.error('Falha ao executar ROLLBACK da transação.', erroRollback);
      }
    }

    throw erro;
  } finally {
    client.release();
  }
}

async function obterOuCriarSupermercado(
  client: PoolClient,
  cnpj: string,
  nomeEmitente: string,
  endereco: string
): Promise<number> {
  const supResult = await client.query(
    `INSERT INTO supermercado (cnpj, nome_fantasia, endereco_completo)
     VALUES ($1, $2, $3)
     ON CONFLICT (cnpj)
     DO UPDATE SET
       nome_fantasia = EXCLUDED.nome_fantasia,
       endereco_completo = COALESCE(supermercado.endereco_completo, EXCLUDED.endereco_completo)
     RETURNING id_supermercado`,
    [cnpj, nomeEmitente, endereco]
  );

  return supResult.rows[0].id_supermercado;
}

async function resolverOuInserirProduto(
  client: PoolClient,
  item: ItemNota
): Promise<number> {
  const nomeOriginal = item.nome;
  const nomeNormalizado = ProdutoService.normalizarNome(nomeOriginal);
  const categoria = ProdutoService.classificarCategoria(nomeNormalizado);
  const medida = ProdutoService.extrairMedida(nomeNormalizado);

  const precisaRevisao = categoria === 'Não classificado';
  const statusEnriquecimento = precisaRevisao ? 'PENDENTE' : 'CONCLUIDO';
  const dataEnriquecimento = statusEnriquecimento === 'CONCLUIDO' ? new Date() : null;
  const isEnriquecido = statusEnriquecimento === 'CONCLUIDO';

  if (item.codigoBarras) {
    const produtoResult = await client.query(
      `INSERT INTO produto (
        codigo_barras,
        nome_produto,
        nome_original,
        nome_normalizado,
        categoria,
        peso,
        unidade_medida,
        status_enriquecimento,
        data_enriquecimento,
        enriquecido
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (codigo_barras)
      DO UPDATE SET
        nome_normalizado = COALESCE(produto.nome_normalizado, EXCLUDED.nome_normalizado)
      RETURNING id_produto`,
      [
        item.codigoBarras,
        nomeNormalizado,
        nomeOriginal,
        nomeNormalizado,
        categoria,
        medida?.quantidade ?? null,
        medida?.unidade ?? null,
        statusEnriquecimento,
        dataEnriquecimento,
        isEnriquecido,
      ]
    );
    return produtoResult.rows[0].id_produto;
  } else {
    const buscaProd = await client.query(
      `SELECT id_produto FROM produto WHERE codigo_barras IS NULL AND nome_normalizado = $1 LIMIT 1`,
      [nomeNormalizado]
    );

    if (buscaProd.rows.length > 0) {
      return buscaProd.rows[0].id_produto;
    }

    const insertProd = await client.query(
      `INSERT INTO produto (
        codigo_barras,
        nome_produto,
        nome_original,
        nome_normalizado,
        categoria,
        peso,
        unidade_medida,
        status_enriquecimento,
        data_enriquecimento,
        enriquecido
      ) VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id_produto`,
      [
        nomeNormalizado,
        nomeOriginal,
        nomeNormalizado,
        categoria,
        medida?.quantidade ?? null,
        medida?.unidade ?? null,
        statusEnriquecimento,
        dataEnriquecimento,
        isEnriquecido,
      ]
    );
    return insertProd.rows[0].id_produto;
  }
}

function extrairItensDaNota(
  $: cheerio.CheerioAPI,
  cnpj: string
): ItemNota[] {
  const itens: ItemNota[] = [];

  $('#tabResult tr')
    .filter((_, row) => $(row).find('.txtTit').length > 0)
    .each((_, row) => {
      const nome = $(row).find('.txtTit').first().text().trim();
      const qtdTexto = $(row).find('.Rqtd').text();

      const quantidade = parseMoeda(qtdTexto) || 1;
      const unidade = $(row)
        .find('.RUN')
        .text()
        .replace('UN:', '')
        .trim();
      
      const codigoRaw = $(row)
        .find('.RCod')
        .text()
        .replace(/\D/g, '')
        .trim();
      
      const codigoBarras = (codigoRaw.length >= 8) ? codigoRaw : null;

      const precoRaw = $(row)
        .find('.RvlUnit')
        .text();
      const preco = parseMoeda(precoRaw);

      if (!nome || !Number.isFinite(preco) || preco <= 0) {
        return;
      }

      itens.push({
        nome,
        codigoBarras,
        preco,
        quantidade,
        unidade,
      });
    });

  return itens;
}

function extrairDadosEmitente($: cheerio.CheerioAPI) {
  const nomeEmitente = $('#u20').text().trim() || 'Supermercado';
  let cnpj = '';
  let endereco = '';

  $('.text').each((_, el) => {
    const texto = $(el).text().trim();

    if (texto.includes('CNPJ:')) {
      cnpj = texto.replace('CNPJ:', '').replace(/\D/g, '').trim();
    } else if (
      texto.includes('RUA') ||
      texto.includes('AV') ||
      texto.includes('ALAMEDA')
    ) {
      endereco = texto.replace(/\s+/g, ' ').trim();
    }
  });

  return { nomeEmitente, cnpj, endereco };
}

function extrairTotal(textoPagina: string, fallback = 0): number {
  const totalMatch = textoPagina.match(/Valor a pagar R\$:\s*([\d,.]+)/);

  if (!totalMatch) {
    return fallback;
  }

  return parseMoeda(totalMatch[1]);
}

function extrairDataEmissao(textoPagina: string): Date {
  const emissaoMatch = textoPagina.match(
    /Emissão:\s*(\d{2})\/(\d{2})\/(\d{2,4})\s+(\d{2}):(\d{2}):(\d{2})/
  );

  if (!emissaoMatch) {
    return new Date();
  }

  const dataParsed = parseDataSefaz(emissaoMatch[0].replace('Emissão:', '').trim());
  return dataParsed || new Date();
}

export async function processarNotaPorUrl(
  url_qrcode: string,
  id_usuario: number,
  idNotaExistente?: number
) {
  if (!validarUrlSefaz(url_qrcode)) {
    throw new Error('URL de QR Code da SEFAZ inválida ou não autorizada.');
  }

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
  } catch {
    logger.warn('Não foi possível fazer o parsing prévio da URL do QR Code.');
  }

  const resposta = await axios.get(url_qrcode, {
    maxRedirects: 5,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    },
    timeout: 15000,
  });

  const $ = cheerio.load(resposta.data);
  const textoPagina = $.text();

  if (
    textoPagina.includes('Digest Value') ||
    textoPagina.includes('inconsistente')
  ) {
    throw new Error(
      'Nota fiscal em contingência ou com assinatura inconsistente na SEFAZ.'
    );
  }

  const valorTotalNota = extrairTotal(textoPagina, valorTotalFallback);
  const dataEmissaoDB = extrairDataEmissao(textoPagina);
  const dadosEmitente = extrairDadosEmitente($);

  const cnpj = dadosEmitente.cnpj || cnpjFallback;

  if (!cnpj) {
    throw new Error('Não foi possível ler o CNPJ da nota.');
  }

  const itensDaNota = extrairItensDaNota($, cnpj);

  return comTransacao(async (client) => {
    const idSupermercado = await obterOuCriarSupermercado(
      client,
      cnpj,
      dadosEmitente.nomeEmitente,
      dadosEmitente.endereco
    );

    let idNota: number;

    if (idNotaExistente) {
      await client.query(
        `UPDATE nota_fiscal
         SET id_supermercado = $1,
             data_compra = $2,
             valor_total = $3,
             status = 'PROCESSADA'
         WHERE id_nota = $4`,
        [idSupermercado, dataEmissaoDB, valorTotalNota, idNotaExistente]
      );

      await client.query('DELETE FROM nota_item WHERE id_nota = $1', [
        idNotaExistente,
      ]);

      idNota = idNotaExistente;
    } else {
      const notaResult = await client.query(
        `INSERT INTO nota_fiscal (
          id_usuario,
          id_supermercado,
          data_compra,
          valor_total,
          chave_nfce,
          status
        )
        VALUES ($1, $2, $3, $4, $5, 'PROCESSADA')
        RETURNING id_nota`,
        [
          id_usuario,
          idSupermercado,
          dataEmissaoDB,
          valorTotalNota,
          chaveNfceFallback || url_qrcode,
        ]
      );

      idNota = notaResult.rows[0].id_nota;
    }

    const produtosSalvos: string[] = [];
    const itensParaInserir: Array<{ idProduto: number; item: ItemNota }> = [];

    for (const item of itensDaNota) {
      const idProduto = await resolverOuInserirProduto(client, item);
      itensParaInserir.push({ idProduto, item });
      produtosSalvos.push(item.nome);
    }

    // Batch Insert otimizado na tabela nota_item
    if (itensParaInserir.length > 0) {
      const valoresSql: string[] = [];
      const parametrosSql: any[] = [];
      let paramIndex = 1;

      for (const { idProduto, item } of itensParaInserir) {
        valoresSql.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        parametrosSql.push(idNota, idProduto, item.quantidade, item.unidade, item.preco);
      }

      await client.query(
        `INSERT INTO nota_item (id_nota, id_produto, quantidade, unidade, valor_unitario)
         VALUES ${valoresSql.join(', ')}`,
        parametrosSql
      );

      // Atualização das ofertas do supermercado
      for (const { idProduto, item } of itensParaInserir) {
        await client.query(
          `INSERT INTO oferta_supermercado (id_supermercado, id_produto, preco_atual, data_atualizacao)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (id_supermercado, id_produto)
           DO UPDATE SET preco_atual = EXCLUDED.preco_atual, data_atualizacao = NOW()`,
          [idSupermercado, idProduto, item.preco]
        );
      }
    }

    return {
      sucesso: true,
      supermercado: dadosEmitente.nomeEmitente,
      produtos_salvos: produtosSalvos.length,
      produtos: produtosSalvos,
      valor_total: valorTotalNota,
      chave_nfce: chaveNfceFallback,
    };
  });
}

export async function processarHtmlSefazManual(
  htmlContent: string,
  id_usuario: number,
  idNotaExistente: number
) {
  logger.info(
    `HTML recebido para parse (Nota ID ${idNotaExistente}). Tamanho: ${htmlContent?.length || 0} caracteres`
  );

  if (!htmlContent || htmlContent.length < 200) {
    throw new Error('O HTML recebido está vazio ou incompleto.');
  }

  const $ = cheerio.load(htmlContent);
  const textoPagina = $.text();

  const valorTotalNota = extrairTotal(textoPagina);
  const dataEmissaoDB = extrairDataEmissao(textoPagina);
  const dadosEmitente = extrairDadosEmitente($);

  if (!dadosEmitente.cnpj) {
    throw new Error(
      'Não foi possível identificar o CNPJ da nota no HTML fornecido.'
    );
  }

  const itensDaNota = extrairItensDaNota($, dadosEmitente.cnpj);

  logger.info(`Itens encontrados no HTML: ${itensDaNota.length}`);

  return comTransacao(async (client) => {
    const idSupermercado = await obterOuCriarSupermercado(
      client,
      dadosEmitente.cnpj,
      dadosEmitente.nomeEmitente,
      dadosEmitente.endereco
    );

    await client.query(
      `UPDATE nota_fiscal
       SET id_supermercado = $1,
           data_compra = $2,
           valor_total = $3,
           status = 'PROCESSADA'
       WHERE id_nota = $4`,
      [
        idSupermercado,
        dataEmissaoDB,
        valorTotalNota,
        idNotaExistente,
      ]
    );

    await client.query('DELETE FROM nota_item WHERE id_nota = $1', [
      idNotaExistente,
    ]);

    const produtosSalvos: string[] = [];
    const itensParaInserir: Array<{ idProduto: number; item: ItemNota }> = [];

    for (const item of itensDaNota) {
      const idProduto = await resolverOuInserirProduto(client, item);
      itensParaInserir.push({ idProduto, item });
      produtosSalvos.push(item.nome);
    }

    // Batch Insert otimizado na tabela nota_item
    if (itensParaInserir.length > 0) {
      const valoresSql: string[] = [];
      const parametrosSql: any[] = [];
      let paramIndex = 1;

      for (const { idProduto, item } of itensParaInserir) {
        valoresSql.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        parametrosSql.push(idNotaExistente, idProduto, item.quantidade, item.unidade, item.preco);
      }

      await client.query(
        `INSERT INTO nota_item (id_nota, id_produto, quantidade, unidade, valor_unitario)
         VALUES ${valoresSql.join(', ')}`,
        parametrosSql
      );

      for (const { idProduto, item } of itensParaInserir) {
        await client.query(
          `INSERT INTO oferta_supermercado (id_supermercado, id_produto, preco_atual, data_atualizacao)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (id_supermercado, id_produto)
           DO UPDATE SET preco_atual = EXCLUDED.preco_atual, data_atualizacao = NOW()`,
          [idSupermercado, idProduto, item.preco]
        );
      }
    }

    return {
      sucesso: true,
      supermercado: dadosEmitente.nomeEmitente,
      produtos_salvos: produtosSalvos.length,
      produtos: produtosSalvos,
      valor_total: valorTotalNota,
    };
  });
}