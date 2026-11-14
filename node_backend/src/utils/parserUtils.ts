/**
 * Converte strings monetárias brasileiras ou internacionais (ex: "R$ 1.250,50", "12.90", "0,99")
 */
export function parseMoeda(valorStr: string | number | null | undefined): number {
  if (valorStr === null || valorStr === undefined || valorStr === '') {
    return 0;
  }

  if (typeof valorStr === 'number') {
    return isNaN(valorStr) ? 0 : Number(valorStr.toFixed(2));
  }

  // Remove "R$", espaços, quebras de linha e caracteres não numéricos (exceto ponto, vírgula e sinal negativo)
  let limpo = valorStr.replace(/[^\d.,-]/g, '').trim();

  if (!limpo) return 0;

  // Caso 1: Formato brasileiro com vírgula decimal (ex: "1.250,50" ou "15,90")
  if (limpo.includes(',')) {
    // Remove pontos de milhar e troca a vírgula decimal por ponto
    limpo = limpo.replace(/\./g, '').replace(',', '.');
  }

  const numero = parseFloat(limpo);
  return isNaN(numero) ? 0 : Number(numero.toFixed(2));
}

/**
 * Normaliza diferentes formatos de data/hora retornados pelos portais estaduais da SEFAZ
 * (ex: "13/11/2026 17:30:00", "13/11/2026", "2026-11-13T17:30:00-03:00") para objeto Date válido.
 */
export function parseDataSefaz(dataStr: string | null | undefined): Date | null {
  if (!dataStr || typeof dataStr !== 'string') {
    return null;
  }

  const limpo = dataStr.trim();

  // Formato ISO (ex: 2026-11-13 ou 2026-11-13T17:30:00-03:00)
  if (/^\d{4}-\d{2}-\d{2}/.test(limpo)) {
    const dataIso = new Date(limpo);
    return isNaN(dataIso.getTime()) ? null : dataIso;
  }

  // Formato Brasileiro: DD/MM/YYYY ou DD/MM/YYYY HH:mm:ss
  const matchBr = limpo.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (matchBr) {
    const [, dia, mes, ano, hora = '00', minuto = '00', segundo = '00'] = matchBr;
    const dataConstruida = new Date(
      Number(ano),
      Number(mes) - 1, // Mês no JS começa em 0
      Number(dia),
      Number(hora),
      Number(minuto),
      Number(segundo)
    );

    // Valida se a data não transbordou (ex: 31/02/2026 virando março)
    if (
      dataConstruida.getFullYear() === Number(ano) &&
      dataConstruida.getMonth() === Number(mes) - 1 &&
      dataConstruida.getDate() === Number(dia)
    ) {
      return dataConstruida;
    }
  }

  return null;
}

export function validarUrlSefaz(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);

    // 1. Apenas HTTPS é permitido para portais da SEFAZ
    if (url.protocol !== 'https:') {
      return false;
    }

    // 2. Bloquear endereços locais / IPs privados (prevenção primária de SSRF)
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return false;
    }

    // 3. Validar se o domínio termina com extensões oficiais de órgãos governamentais ou SEFAZ estaduais
    const dominiosPermitidos = ['.gov.br', 'fazenda.', 'sefaz.'];
    const ehDominioValido = dominiosPermitidos.some(termo => hostname.includes(termo));

    return ehDominioValido;
  } catch {
    return false; // URL malformada
  }
}