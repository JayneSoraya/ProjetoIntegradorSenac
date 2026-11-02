import axios from 'axios';
import * as cheerio from 'cheerio';
import { pool } from '../database';
import { logger } from '../utils/logger';

function classificarProduto(nome: string): string {
  const n = nome.toLowerCase();

  if (/refrig|suco|agua|mineral|cerveja|vinho|achoc|cafe|cha |chá |energet|isoton|whisky|vodka|rum|drink|guarana|coca|pepsi|fanta/.test(n))
    return 'Bebidas';

  if (/deterg|sanit|desinf|limpeza|amaciante|sabao|sabonete|shampoo|creme|dental|escova|papel hig|fralda|absorv|desodor|perfume/.test(n))
    return 'Higiene e Limpeza';
  
  if (/peixe|frango|carne|file|linguica|salsicha|presunto|bacon|atum|sardinha|camarao/.test(n))
    return 'Carnes e Peixes';

  if (/arroz|feijao|macarr|farinha|acucar|sal|oleo|azeite|vinagre|molho|extrato|tempero|maionese|ketchup|mostarda|cuscuz/.test(n))
    return 'Alimentos';

  if (/biscoito|bolacha|salgadin|batata palh|chocolate|bala |chicle|sorvete|wafer/.test(n))
    return 'Snacks';

  if (/pao |torrada|bolo |massa |croissant/.test(n))
    return 'Padaria';

  if (/queijo|iogurt|iogurte|manteiga|margarina|requeijao|nata|creme de leite|leite/.test(n))
    return 'Laticínios';

  if (/banana|maca|maçã|laranja|limao|limão|uva|mamao|mamão|tomate|alface|cenoura|batata|cebola|alho/.test(n))
    return 'Hortifruti';

  return 'Não classificado';
}

export async function processarNotaPorUrl(url_qrcode: string, id_usuario: number, idNotaExistente?: number) {
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
    logger.warn('⚠️ Não foi possível fazer o parsing prévio da URL do QR Code.');
  }

  // 1. Busca HTML da SEFAZ SP
  const resposta = await axios.get(url_qrcode, {
    maxRedirects: 5,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    },
    timeout: 15000,
  });

  const $ = cheerio.load(resposta.data);
  const textoPagina = $.text();

  if (textoPagina.includes('Digest Value') || textoPagina.includes('inconsistente')) {
    throw new Error('Nota fiscal em contingência ou com assinatura inconsistente na SEFAZ.');
  }

  const totalMatch = textoPagina.match(/Valor a pagar R\$:\s*([\d,.]+)/);
  const valorTotalNota = totalMatch
    ? parseFloat(totalMatch[1].replace('.', '').replace(',', '.'))
    : valorTotalFallback;

  const emissaoMatch = textoPagina.match(/Emissão:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/);
  const dataEmissaoDB = emissaoMatch
    ? new Date(emissaoMatch[1].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'))
    : new Date();

  const nomeEmitente = $('#u20').text().trim() || 'Supermercado';
  let cnpj = '';
  let endereco = '';

  $('.text').each((_, el) => {
    const texto = $(el).text().trim();
    if (texto.includes('CNPJ:')) {
      cnpj = texto.replace('CNPJ:', '').replace(/\D/g, '').trim();
    } else if (texto.includes('RUA') || texto.includes('AV') || texto.includes('ALAMEDA')) {
      endereco = texto.replace(/\s+/g, ' ').trim();
    }
  });

  if (!cnpj) cnpj = cnpjFallback;
  if (!cnpj) throw new Error('Não foi possível ler o CNPJ da nota.');

  // 2. Salva ou localiza o supermercado
  const supExiste = await pool.query(
    'SELECT id_supermercado FROM supermercado WHERE cnpj = $1',
    [cnpj]
  );

  let idSupermercado: number;
  if (supExiste.rows.length > 0) {
    idSupermercado = supExiste.rows[0].id_supermercado;
  } else {
    const novoSup = await pool.query(
      `INSERT INTO supermercado (cnpj, nome_fantasia, endereco_completo)
       VALUES ($1, $2, $3) RETURNING id_supermercado`,
      [cnpj, nomeEmitente, endereco]
    );
    idSupermercado = novoSup.rows[0].id_supermercado;
  }

  // 3. Coleta produtos
  const itensDaNota: { nome: string; codigo: string; preco: number; quantidade: number; unidade: string }[] = [];

  $('#tabResult tr').filter((_, row) => {
    return $(row).find('.txtTit').length > 0;
  }).each((_, row) => {
    const nome = $(row).find('.txtTit').first().text().trim();
    const qtdTexto = $(row).find('.Rqtd').text().replace(/[^\d,]/g, '').replace(',', '.');
    const quantidade = parseFloat(qtdTexto) || 1;
    const unidade = $(row).find('.RUN').text().replace('UN:', '').trim();
    const codigoRaw = $(row).find('.RCod').text().replace(/\D/g, '').trim();
    const precoRaw = $(row).find('.RvlUnit').text().replace(/[^\d,]/g, '').replace(',', '.');
    const preco = parseFloat(precoRaw);

    if (!nome || isNaN(preco) || preco <= 0) return;

    itensDaNota.push({
      nome,
      codigo: codigoRaw || `${cnpj}_${nome.substring(0, 15).replace(/\s/g, '_')}`,
      preco,
      quantidade,
      unidade
    });
  });

  let idNota: number;

  await pool.query('BEGIN');

  if (idNotaExistente) {
    // Se a nota já existia em contingência, atualizamos os dados dela para PROCESSADA
    await pool.query(
      `UPDATE nota_fiscal 
       SET id_supermercado = $1, data_compra = $2, valor_total = $3, status = 'PROCESSADA'
       WHERE id_nota = $4`,
      [idSupermercado, dataEmissaoDB, valorTotalNota, idNotaExistente]
    );
    idNota = idNotaExistente;
  } else {
    // Senão, criamos uma nova nota PROCESSADA
    const notaResult = await pool.query(
      `INSERT INTO nota_fiscal (id_usuario, id_supermercado, data_compra, valor_total, chave_nfce, status)
       VALUES ($1, $2, $3, $4, $5, 'PROCESSADA')
       RETURNING id_nota`,
      [id_usuario, idSupermercado, dataEmissaoDB, valorTotalNota, chaveNfceFallback || url_qrcode]
    );
    idNota = notaResult.rows[0].id_nota;
  }

  const produtosSalvos: string[] = [];

  for (const item of itensDaNota) {
    let idProduto: number;
    const categoria = classificarProduto(item.nome);

    const prodExiste = await pool.query(
      'SELECT id_produto FROM produto WHERE codigo_barras = $1',
      [item.codigo]
    );

    if (prodExiste.rows.length > 0) {
      idProduto = prodExiste.rows[0].id_produto;
    } else {
      const novoProd = await pool.query(
        `INSERT INTO produto (codigo_barras, nome_produto, categoria) VALUES ($1, $2, $3) RETURNING id_produto`,
        [item.codigo, item.nome, categoria]
      );
      idProduto = novoProd.rows[0].id_produto;
    }

    await pool.query(
      `INSERT INTO nota_item (id_nota, id_produto, quantidade, unidade, valor_unitario) VALUES ($1, $2, $3, $4, $5)`,
      [idNota, idProduto, item.quantidade, item.unidade, item.preco]
    );

    await pool.query(
      `INSERT INTO oferta_supermercado (id_supermercado, id_produto, preco_atual, data_atualizacao)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (id_supermercado, id_produto)
       DO UPDATE SET preco_atual = $3, data_atualizacao = NOW()`,
      [idSupermercado, idProduto, item.preco]
    );

    produtosSalvos.push(item.nome);
  }

  await pool.query('COMMIT');

  return {
    sucesso: true,
    supermercado: nomeEmitente,
    produtos_salvos: produtosSalvos.length,
    produtos: produtosSalvos,
    valor_total: valorTotalNota,
    chave_nfce: chaveNfceFallback
  };
}

export async function processarHtmlSefazManual(htmlContent: string, id_usuario: number, idNotaExistente: number) {
  // 👈 O logger que querias colocar para depuração
  logger.info(`HTML recebido para parse (Nota ID ${idNotaExistente}). Tamanho: ${htmlContent?.length || 0} caracteres`);

  if (!htmlContent || htmlContent.length < 200) {
    throw new Error('O HTML recebido está vazio ou incompleto.');
  }

  const $ = cheerio.load(htmlContent);
  const textoPagina = $.text();

  // Extração dos dados gerais da nota diretamente do HTML renderizado
  const totalMatch = textoPagina.match(/Valor a pagar R\$:\s*([\d,.]+)/);
  const valorTotalNota = totalMatch
    ? parseFloat(totalMatch[1].replace('.', '').replace(',', '.'))
    : 0;

  const emissaoMatch = textoPagina.match(/Emissão:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/);
  const dataEmissaoDB = emissaoMatch
    ? new Date(emissaoMatch[1].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'))
    : new Date();

  const nomeEmitente = $('#u20').text().trim() || 'Supermercado';
  let cnpj = '';
  let endereco = '';

  $('.text').each((_, el) => {
    const texto = $(el).text().trim();
    if (texto.includes('CNPJ:')) {
      cnpj = texto.replace('CNPJ:', '').replace(/\D/g, '').trim();
    } else if (texto.includes('RUA') || texto.includes('AV') || texto.includes('ALAMEDA')) {
      endereco = texto.replace(/\s+/g, ' ').trim();
    }
  });

  if (!cnpj) {
    throw new Error('Não foi possível identificar o CNPJ da nota no HTML fornecido.');
  }

  // 1. Salva ou localiza o supermercado
  const supExiste = await pool.query(
    'SELECT id_supermercado FROM supermercado WHERE cnpj = $1',
    [cnpj]
  );

  let idSupermercado: number;
  if (supExiste.rows.length > 0) {
    idSupermercado = supExiste.rows[0].id_supermercado;
  } else {
    const novoSup = await pool.query(
      `INSERT INTO supermercado (cnpj, nome_fantasia, endereco_completo)
       VALUES ($1, $2, $3) RETURNING id_supermercado`,
      [cnpj, nomeEmitente, endereco]
    );
    idSupermercado = novoSup.rows[0].id_supermercado;
  }

  // 2. Coleta produtos da tabela `#tabResult` presente no HTML do WebView
  const itensDaNota: { nome: string; codigo: string; preco: number; quantidade: number; unidade: string }[] = [];

  $('#tabResult tr').filter((_, row) => {
    return $(row).find('.txtTit').length > 0;
  }).each((_, row) => {
    const nome = $(row).find('.txtTit').first().text().trim();
    const qtdTexto = $(row).find('.Rqtd').text().replace(/[^\d,]/g, '').replace(',', '.');
    const quantidade = parseFloat(qtdTexto) || 1;
    const unidade = $(row).find('.RUN').text().replace('UN:', '').trim();
    const codigoRaw = $(row).find('.RCod').text().replace(/\D/g, '').trim();
    const precoRaw = $(row).find('.RvlUnit').text().replace(/[^\d,]/g, '').replace(',', '.');
    const preco = parseFloat(precoRaw);

    if (!nome || isNaN(preco) || preco <= 0) return;

    itensDaNota.push({
      nome,
      codigo: codigoRaw || `${cnpj}_${nome.substring(0, 15).replace(/\s/g, '_')}`,
      preco,
      quantidade,
      unidade
    });
  });

  logger.info(`Itens encontrados no HTML: ${itensDaNota.length}`);

  await pool.query('BEGIN');

  // Atualiza a nota existente para PROCESSADA
  await pool.query(
    `UPDATE nota_fiscal 
     SET id_supermercado = $1, data_compra = $2, valor_total = $3, status = 'PROCESSADA'
     WHERE id_nota = $4`,
    [idSupermercado, dataEmissaoDB, valorTotalNota, idNotaExistente]
  );

  const produtosSalvos: string[] = [];

  for (const item of itensDaNota) {
    let idProduto: number;
    const categoria = classificarProduto(item.nome); 

    const prodExiste = await pool.query(
      'SELECT id_produto FROM produto WHERE codigo_barras = $1',
      [item.codigo]
    );

    if (prodExiste.rows.length > 0) {
      idProduto = prodExiste.rows[0].id_produto;
    } else {
      const novoProd = await pool.query(
        `INSERT INTO produto (codigo_barras, nome_produto, categoria) VALUES ($1, $2, $3) RETURNING id_produto`,
        [item.codigo, item.nome, categoria]
      );
      idProduto = novoProd.rows[0].id_produto;
    }

    await pool.query(
      `INSERT INTO nota_item (id_nota, id_produto, quantidade, unidade, valor_unitario) VALUES ($1, $2, $3, $4, $5)`,
      [idNotaExistente, idProduto, item.quantidade, item.unidade, item.preco]
    );

    produtosSalvos.push(item.nome);
  }

  await pool.query('COMMIT');

  return {
    sucesso: true,
    supermercado: nomeEmitente,
    produtos_salvos: produtosSalvos.length,
    produtos: produtosSalvos,
    valor_total: valorTotalNota
  };
}