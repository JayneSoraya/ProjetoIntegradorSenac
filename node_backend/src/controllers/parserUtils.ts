export function parseMoeda(texto: string): number {
  if (!texto) return 0;
  // Remove tudo exceto dígitos, pontos e vírgulas
  const limpo = texto.replace(/[^\d.,]/g, '').trim();
  if (!limpo) return 0;

  // Formato brasileiro padrão com milhar e decimal (ex: 1.234,56)
  if (limpo.includes('.') && limpo.includes(',')) {
    const normalizado = limpo.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalizado) || 0;
  }
  
  // Apenas vírgula como decimal (ex: 1234,56)
  if (limpo.includes(',')) {
    const normalizado = limpo.replace(',', '.');
    return parseFloat(normalizado) || 0;
  }

  // Apenas ponto ou sem separador (ex: 1234.56 ou 1234)
  return parseFloat(limpo) || 0;
}

/**
 * Extrai a data e hora de emissão lidando com diferentes rótulos da SEFAZ (SP, RJ, MG, RS, etc.)
 */
export function parseDataEmissao(textoPagina: string): Date {
  const regexes = [
    /Emissão:\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/i,
    /Data\s+de\s+Emiss[ãa]o:\s*(\d{2})\/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/i,
    /Data\/Hora\s+Emissão:\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/i,
    // Variações sem segundos
    /Emissão:\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/i,
    /Data\s+de\s+Emiss[ãa]o:\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/i,
  ];

  for (const regex of regexes) {
    const match = textoPagina.match(regex);
    if (match) {
      const [, dia, mes, ano, hora, minuto, segundo = '0'] = match;
      return new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia),
        Number(hora),
        Number(minuto),
        Number(segundo)
      );
    }
  }

  return new Date();
}

/**
 * Extrai o valor total da nota buscando por múltiplos termos comuns em diferentes estados
 */
export function parseValorTotal(textoPagina: string, fallback = 0): number {
  const regexes = [
    /Valor a pagar R\$:\s*([\d,.]+)/i,
    /Valor Total R\$:\s*([\d,.]+)/i,
    /Valor total da Nota:\s*([\d,.]+)/i,
    /TOTAL\s+R?\$?\s*([\d,.]+)/i,
  ];

  for (const regex of regexes) {
    const match = textoPagina.match(regex);
    if (match) {
      const valor = parseMoeda(match[1]);
      if (valor > 0) return valor;
    }
  }

  return fallback;
}