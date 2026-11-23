import * as cheerio from 'cheerio';

export interface ParsedNfceItem {
  nome: string;
  codigo: string;
  preco: number;
  quantidade: number;
}

export interface ParsedNfce {
  nomeEmitente: string;
  cnpj: string;
  endereco: string;
  itens: ParsedNfceItem[];
}

export function parseBrazilianNumber(raw: string): number | null {
  const value = raw.replace(/[^\d.,-]/g, '').trim();
  if (!value) return null;

  const normalized = value.includes(',')
    ? value.replace(/\./g, '').replace(',', '.')
    : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function extractNfceAccessKey(url: URL, html: string): string | null {
  const documentText = cheerio.load(html).text();
  const candidates = [url.searchParams.get('p') ?? '', decodeURIComponent(url.toString()), documentText];

  for (const candidate of candidates) {
    const compact = candidate.replace(/\s/g, '');
    const match = compact.match(/(?:^|\D)(\d{44})(?:\D|$)/);
    if (match) return match[1];
  }
  return null;
}

export function parseNfceHtml(html: string): ParsedNfce {
  const $ = cheerio.load(html);
  const nomeEmitente = $('#u20').text().trim();

  let cnpj = '';
  let endereco = '';

  $('.text').each((_, element) => {
    const texto = $(element).text().trim();
    if (texto.includes('CNPJ:')) {
      cnpj = texto.replace('CNPJ:', '').replace(/\D/g, '').trim();
      return;
    }

    const normalized = texto.toUpperCase();
    if (
      normalized.includes('RUA')
      || normalized.includes('AVENIDA')
      || normalized.startsWith('AV ')
      || normalized.includes('ALAMEDA')
    ) {
      endereco = texto.replace(/\s+/g, ' ').trim();
    }
  });

  const itens: ParsedNfceItem[] = [];
  $('#tabResult tr')
    .filter((_, row) => $(row).find('.txtTit').length > 0)
    .each((_, row) => {
      const nome = $(row).find('.txtTit').first().text().trim();
      const codigoRaw = $(row).find('.RCod').text().replace(/\D/g, '').trim();
      const preco = parseBrazilianNumber($(row).find('.RvlUnit').text());
      const quantidade = parseBrazilianNumber($(row).find('.Rqtd').text()) ?? 1;

      if (!nome || preco == null || preco <= 0 || quantidade <= 0) return;

      itens.push({
        nome,
        codigo: codigoRaw || `${cnpj}_${nome.substring(0, 15).replace(/\s/g, '_')}`,
        preco,
        quantidade,
      });
    });

  return { nomeEmitente, cnpj, endereco, itens };
}
