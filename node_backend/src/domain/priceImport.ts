import { createHash } from 'node:crypto';

export interface PriceImportRecord {
  codigoProduto: string;
  nomeProduto: string;
  ean: string;
  preco: number;
  precoFidelidade: number | null;
  unidade: string;
  marca: string;
  categoria: string;
}

export interface PriceImportError {
  linha: number;
  codigo: string;
  mensagem: string;
  registro: unknown;
}

export interface PriceImportValidation {
  checksum: string;
  validos: PriceImportRecord[];
  erros: PriceImportError[];
  total: number;
}

function readText(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    if (raw[key] != null) return String(raw[key]).trim();
  }
  return '';
}

function parsePrice(value: unknown): number | null {
  if (value == null || value === '') return null;
  const normalized = typeof value === 'string' ? value.trim().replace(',', '.') : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validatePriceImport(records: unknown): PriceImportValidation {
  if (!Array.isArray(records) || records.length === 0 || records.length > 5000) {
    throw new Error('INVALID_IMPORT_SIZE');
  }

  const validos: PriceImportRecord[] = [];
  const erros: PriceImportError[] = [];
  const seen = new Set<string>();

  records.forEach((value, index) => {
    const linha = index + 2;
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      erros.push({ linha, codigo: 'REGISTRO_INVALIDO', mensagem: 'Registro deve ser um objeto.', registro: value });
      return;
    }

    const raw = value as Record<string, unknown>;
    const codigoProduto = readText(raw, 'codigoProduto', 'codigo_produto');
    const ean = readText(raw, 'ean', 'codigo_barras').replace(/\s/g, '');
    const code = ean || codigoProduto;
    const nomeProduto = readText(raw, 'nomeProduto', 'nome_produto', 'nome');
    const unidade = readText(raw, 'unidade', 'unidade_medida');
    const marca = readText(raw, 'marca');
    const categoria = readText(raw, 'categoria') || 'Outros';
    const preco = parsePrice(raw.preco ?? raw.preco_atual);
    const precoFidelidade = parsePrice(raw.precoFidelidade ?? raw.preco_fidelidade);

    if (!code || code.length > 64) {
      erros.push({ linha, codigo: 'CODIGO_OBRIGATORIO', mensagem: 'Informe EAN ou código do produto válido.', registro: value });
      return;
    }
    if (!nomeProduto || nomeProduto.length > 160) {
      erros.push({ linha, codigo: 'NOME_OBRIGATORIO', mensagem: 'Informe nome do produto válido.', registro: value });
      return;
    }
    if (preco == null || preco <= 0 || preco > 1_000_000) {
      erros.push({ linha, codigo: 'PRECO_INVALIDO', mensagem: 'Preço deve ser numérico e maior que zero.', registro: value });
      return;
    }
    if (precoFidelidade != null && (precoFidelidade <= 0 || precoFidelidade > 1_000_000)) {
      erros.push({ linha, codigo: 'PRECO_FIDELIDADE_INVALIDO', mensagem: 'Preço fidelidade inválido.', registro: value });
      return;
    }
    if (seen.has(code)) {
      erros.push({ linha, codigo: 'CODIGO_DUPLICADO', mensagem: 'O mesmo produto aparece mais de uma vez no arquivo.', registro: value });
      return;
    }
    seen.add(code);

    validos.push({
      codigoProduto,
      nomeProduto,
      ean,
      preco: Math.round(preco * 100) / 100,
      precoFidelidade: precoFidelidade == null ? null : Math.round(precoFidelidade * 100) / 100,
      unidade: unidade.slice(0, 30),
      marca: marca.slice(0, 100),
      categoria: categoria.slice(0, 80),
    });
  });

  const checksum = createHash('sha256').update(JSON.stringify(validos)).digest('hex');
  return { checksum, validos, erros, total: records.length };
}
