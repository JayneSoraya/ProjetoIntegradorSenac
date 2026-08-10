import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { pool } from '../database';

function classificarProduto(nome: string): string {
  const n = nome.toLowerCase();

  if (
  /refrig|suco|agua|mineral|cerveja|vinho|achoc|cafe|cha |chá |energet|isoton|whisky|vodka|rum|drink|guarana|coca|pepsi|fanta/.test(n)
)
    return 'Bebidas';

  if (/deterg|sanit|desinf|limpeza|amaciante|sabao|sabonete|shampoo|creme|dental|escova|papel hig|fralda|absorv|desodor|perfume/.test(n)
  ){
return 'Higiene e Limpeza';
}
  
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

  return 'Não classificado'; // fallback
}

export const processarNota = async (req: Request, res: Response) => {
  const { url_qrcode } = req.body;

  if (!url_qrcode) {
    return res.status(400).json({ erro: 'URL do QR code é obrigatória.' });
  }

  try {
    // ── 1. Busca HTML da SEFAZ SP seguindo redirect ────────
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
    const totalMatch =  textoPagina.match(
    /Valor a pagar R\$:\s*([\d,.]+)/
  );

const valorTotalNota = totalMatch
  ? parseFloat(
      totalMatch[1]
        .replace('.', '')
        .replace(',', '.')
    )
  : 0;
  console.log('💰 Valor Total:', valorTotalNota);

  const numeroNota = textoPagina.match(
  /Número:\s*(\d+)/
)?.[1];

console.log('🧾 Nota:', numeroNota);
   // console.log('========== HTML TEXTO ==========');
//console.log($.text());
//console.log('===============================');

const emissaoMatch = textoPagina.match(
  /Emissão:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/
  
);

const dataEmissaoDB = emissaoMatch
  ? new Date(
      emissaoMatch[1]
        .replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')
    )
  : new Date();

//console.log('📅 Emissão:', dataEmissao);

    // ── 2. Extrai dados do emitente ────────────────────────
    const nomeEmitente = $('#u20').text().trim();

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

   //console.log('🏪 Emitente:', nomeEmitente);
   // console.log('📋 CNPJ:', cnpj);
    //console.log('📍 Endereço:', endereco);

    if (!cnpj) {
      return res.status(422).json({
        erro: 'Não foi possível ler o CNPJ da nota.',
      });
    }

    // ── 3. Salva ou localiza o supermercado ───────────────
    const supExiste = await pool.query(
      'SELECT id_supermercado FROM supermercado WHERE cnpj = $1',
      [cnpj]
    );

    let idSupermercado: number;

    if (supExiste.rows.length > 0) {
      idSupermercado = supExiste.rows[0].id_supermercado;
     // console.log('✅ Supermercado já existe, id:', idSupermercado);
    } else {
      const novoSup = await pool.query(
        `INSERT INTO supermercado (cnpj, nome_fantasia, endereco_completo)
         VALUES ($1, $2, $3) RETURNING id_supermercado`,
        [cnpj, nomeEmitente, endereco]
      );
      idSupermercado = novoSup.rows[0].id_supermercado;
      //console.log('🆕 Supermercado criado, id:', idSupermercado);
    }

    // ── 4. Coleta produtos de forma síncrona ──────────────
    const itensDaNota: { nome: string; codigo: string; preco: number; quantidade: number; unidade: string }[] = [];

    $('#tabResult tr').filter((_, row) => {
      return $(row).find('.txtTit').length > 0;
    }).each((_, row) => {
      const nome = $(row).find('.txtTit').first().text().trim();
      const qtdTexto = $(row)
    .find('.Rqtd')
    .text()
    .replace(/[^\d,]/g, '')
    .replace(',', '.');

       const quantidade =
    parseFloat(qtdTexto) || 1;
    const unidade = $(row)
      .find('.RUN')
      .text()
      .replace('UN:', '')
      .trim();
  //console.log($(row).text());

      // Extrai só dígitos — "(Código: 56510)" → "56510"
      const codigoRaw = $(row).find('.RCod').text()
        .replace(/\D/g, '')
        .trim();

      // Preço unitário — "Vl. Unit.: 13,99" → 13.99
      const precoRaw = $(row).find('.RvlUnit').text()
        .replace(/[^\d,]/g, '')
        .replace(',', '.');
       //console.log($(row).html());

      const preco = parseFloat(precoRaw);

      if (!nome || isNaN(preco) || preco <= 0) return;

      itensDaNota.push({
        nome, codigo: codigoRaw ||
          `${cnpj}_${nome.substring(0, 15).replace(/\s/g, '_')}`,
        preco, quantidade,unidade});
  //          console.log({
  //nome,
  //quantidade,
  //unidade,
  //preco,
//});
});
    
    //console.log(`📦 ${itensDaNota.length} produtos encontrados na nota`);
    

    // ── 5. Salva produtos no banco 
    const produtosSalvos: string[] = [];
    if (!req.usuario) {
  return res.status(401).json({ erro: 'Usuário não autenticado.' });
}
const notaResult = await pool.query(
  `
  INSERT INTO nota_fiscal (
    id_usuario,
    id_supermercado,
    data_compra,
    valor_total,
    chave_nfce
  )
  VALUES ($1,$2,$3,$4,$5)
  RETURNING id_nota
  `,
  [
    req.usuario.id_usuario, 
    idSupermercado,
    dataEmissaoDB,
    valorTotalNota,
    url_qrcode
  ]
);
const idNota =
  notaResult.rows[0].id_nota;

    for (const item of itensDaNota) {
      let idProduto: number;
       const categoria = classificarProduto(item.nome);
       const prodExiste = await pool.query(
          `
          SELECT id_produto
          FROM produto
          WHERE codigo_barras = $1
          `,
          [item.codigo]
        );
          if (prodExiste.rows.length > 0) {
            idProduto = prodExiste.rows[0].id_produto;
          } else {
              const novoProd = await pool.query(
                `
                  INSERT INTO produto (
                    codigo_barras,
                    nome_produto,
                    categoria
                  )
                  VALUES ($1, $2, $3)
                  RETURNING id_produto
                  `,
                  [
                    item.codigo,
                    item.nome,
                    categoria,
                  ]
                );
              idProduto = novoProd.rows[0].id_produto;
            }
            await pool.query(
                `
                INSERT INTO nota_item (
                  id_nota,
                  id_produto,
                  quantidade,
                  unidade,
                  valor_unitario
                )
                VALUES ($1,$2,$3,$4,$5)
                `,
                  [
                    idNota,
                    idProduto,
                    item.quantidade,
                    item.unidade,
                    item.preco
                  ]
              );
      // RF22 + RF23 — atualiza preço e data da última atualização
      await pool.query(
        `INSERT INTO oferta_supermercado
           (id_supermercado, id_produto, preco_atual, data_atualizacao)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (id_supermercado, id_produto)
         DO UPDATE SET preco_atual = $3, data_atualizacao = NOW()`,
        [idSupermercado, idProduto, item.preco]
      );

      produtosSalvos.push(item.nome);
     // console.log(`✅ ${item.nome} - R$ ${item.preco}`);
    }

    console.log(`🎉 ${produtosSalvos.length} produtos salvos no banco`);

    return res.status(200).json({
      mensagem: 'Nota processada com sucesso!',
      supermercado: nomeEmitente,
      produtos_salvos: produtosSalvos.length,
      produtos: produtosSalvos,
    });

  } catch (erro: any) {
    console.error('❌ Erro ao processar nota:', erro.message);
    return res.status(500).json({
      erro: 'Erro ao processar a nota fiscal.',
      detalhe: erro.message,
    });
  }
};