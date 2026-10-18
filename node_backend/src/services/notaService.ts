import axios from 'axios';
import * as cheerio from 'cheerio';
import { pool } from '../database';

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

export class NotaService {
  static async processarNotaPorUrl(urlQrCode: string, idUsuario: number) {
   // Valida a URL do QR Code contra SSRF
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlQrCode);
    } catch (error) {
      throw new Error('URL do QR Code inválida ou malformada.');
    }
  if (parsedUrl.protocol !== 'https:'){
    throw new Error('Apenas URLS (HTTPS) seguras são');
  }
  const hostname = parsedUrl.hostname.toLowerCase();
  let baseHost = '';
// Mapeamento de todas as SEFAZ do Brasil (CodeQL compliant)
    if (hostname.endsWith('sefaz.ac.gov.br')) {
      baseHost = 'sefaz.ac.gov.br';
    } else if (hostname.endsWith('sefaz.al.gov.br')) {
      baseHost = 'sefaz.al.gov.br';
    } else if (hostname.endsWith('sefaz.am.gov.br')) {
      baseHost = 'sefaz.am.gov.br';
    } else if (hostname.endsWith('sefaz.ap.gov.br')) {
      baseHost = 'sefaz.ap.gov.br';
    } else if (hostname.endsWith('sefaz.ba.gov.br')) {
      baseHost = 'sefaz.ba.gov.br';
    } else if (hostname.endsWith('sefaz.ce.gov.br')) {
      baseHost = 'sefaz.ce.gov.br';
    } else if (hostname.endsWith('sefaz.df.gov.br')) {
      baseHost = 'sefaz.df.gov.br';
    } else if (hostname.endsWith('sefaz.es.gov.br')) {
      baseHost = 'sefaz.es.gov.br';
    } else if (hostname.endsWith('sefaz.go.gov.br')) {
      baseHost = 'sefaz.go.gov.br';
    } else if (hostname.endsWith('sefaz.ma.gov.br')) {
      baseHost = 'sefaz.ma.gov.br';
    } else if (hostname.endsWith('sefaz.mg.gov.br')) {
      baseHost = 'sefaz.mg.gov.br';
    } else if (hostname.endsWith('sefaz.ms.gov.br')) {
      baseHost = 'sefaz.ms.gov.br';
    } else if (hostname.endsWith('sefaz.mt.gov.br')) {
      baseHost = 'sefaz.mt.gov.br';
    } else if (hostname.endsWith('sefaz.pa.gov.br')) {
      baseHost = 'sefaz.pa.gov.br';
    } else if (hostname.endsWith('sefaz.pb.gov.br')) {
      baseHost = 'sefaz.pb.gov.br';
    } else if (hostname.endsWith('sefaz.pe.gov.br')) {
      baseHost = 'sefaz.pe.gov.br';
    } else if (hostname.endsWith('sefaz.pi.gov.br')) {
      baseHost = 'sefaz.pi.gov.br';
    } else if (hostname.endsWith('fazenda.pr.gov.br')) {
      baseHost = 'www.fazenda.pr.gov.br';
    } else if (hostname.endsWith('sefaz.rj.gov.br')) {
      baseHost = 'sefaz.rj.gov.br';
    } else if (hostname.endsWith('sefaz.rn.gov.br')) {
      baseHost = 'sefaz.rn.gov.br';
    } else if (hostname.endsWith('sefaz.ro.gov.br')) {
      baseHost = 'sefaz.ro.gov.br';
    } else if (hostname.endsWith('sefaz.rr.gov.br')) {
      baseHost = 'sefaz.rr.gov.br';
    } else if (hostname.endsWith('sefaz.rs.gov.br')) {
      baseHost = 'sefaz.rs.gov.br';
    } else if (hostname.endsWith('sefaz.sc.gov.br')) {
      baseHost = 'sefaz.sc.gov.br';
    } else if (hostname.endsWith('sefaz.se.gov.br')) {
      baseHost = 'sefaz.se.gov.br';
    } else if (hostname.endsWith('fazenda.sp.gov.br')) {
      baseHost = 'www.fazenda.sp.gov.br';
    } else if (hostname.endsWith('sefaz.to.gov.br')) {
      baseHost = 'sefaz.to.gov.br';
    } else {
      throw new Error('Domínio da SEFAZ não autorizado ou estado inválido.');
    }

    if (!/^\/[a-zA-Z0-9_\-\/\.]+$/.test(parsedUrl.pathname)) {
      throw new Error('Caminho da URL da SEFAZ inválido ou malformado.');
    }

    const paramP = parsedUrl.searchParams.get('p');
    const paramChNFe = parsedUrl.searchParams.get('chNFe');

    let safeQuery = '';
    if (paramP) {
      safeQuery = `?p=${encodeURIComponent(paramP)}`;
    } else if (paramChNFe) {
      safeQuery = `?chNFe=${encodeURIComponent(paramChNFe)}`;
    } else {
      // Se houver outros parâmetros necessários, trate-os aqui ou valide o searchParams geral
      safeQuery = `?${parsedUrl.searchParams.toString()}`;
    }

    const safeTargetUrl = `https://${baseHost}${parsedUrl.pathname}${safeQuery}`;
    
  // 1. Busca HTML da SEFAZ SP seguindo redirect
    const resposta = await axios.get(safeTargetUrl, {
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(resposta.data);
    const textoPagina = $.root().text();
    const totalMatch = textoPagina.match(/Valor a pagar R\$:\s*([\d,.]+)/);

    const valorTotalNota = totalMatch
      ? parseFloat(totalMatch[1].replace('.', '').replace(',', '.'))
      : 0;

    const emissaoMatch = textoPagina.match(/Emissão:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/);
    const dataEmissaoDB = emissaoMatch
      ? new Date(emissaoMatch[1].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'))
      : new Date();

    // 2. Extrai dados do emitente
    const nomeEmitente = $('#u20').text().trim();
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
      throw new Error('Não foi possível ler o CNPJ da nota.');
    }

    // 3. Salva ou localiza o supermercado
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

    // 4. Coleta produtos
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
        unidade,
      });
    });

    // 5. Salva nota, itens e ofertas no banco
    const notaResult = await pool.query(
      `INSERT INTO nota_fiscal (id_usuario, id_supermercado, data_compra, valor_total, chave_nfce)
       VALUES ($1, $2, $3, $4, $5) RETURNING id_nota`,
      [idUsuario, idSupermercado, dataEmissaoDB, valorTotalNota, urlQrCode]
    );
    const idNota = notaResult.rows[0].id_nota;
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
          `INSERT INTO produto (codigo_barras, nome_produto, categoria)
           VALUES ($1, $2, $3) RETURNING id_produto`,
          [item.codigo, item.nome, categoria]
        );
        idProduto = novoProd.rows[0].id_produto;
      }

      await pool.query(
        `INSERT INTO nota_item (id_nota, id_produto, quantidade, unidade, valor_unitario)
         VALUES ($1, $2, $3, $4, $5)`,
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

    return {
      mensagem: 'Nota processada com sucesso!',
      supermercado: nomeEmitente,
      produtos_salvos: produtosSalvos.length,
      produtos: produtosSalvos,
    };
  }
}