/**
 * Regras puras do histórico do usuário (compras importadas e preços).
 * Mantidas fora do acesso a banco para serem testáveis isoladamente.
 */

export const HISTORICO_LIMITE_PADRAO = 50;
export const HISTORICO_LIMITE_MAXIMO = 100;

/** Interpreta um identificador numérico recebido na URL. Retorna null se inválido. */
export function parseResourceId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^[0-9]{1,15}$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export interface Paginacao {
  limite: number;
  deslocamento: number;
}

function lerInteiro(value: unknown, padrao: number): number {
  if (value === undefined || value === '') return padrao;
  if (typeof value !== 'string' || !/^[0-9]{1,9}$/.test(value)) {
    throw new Error('INVALID_PAGINATION');
  }
  return Number(value);
}

/**
 * Normaliza `limite` e `deslocamento` da query string.
 * Lança INVALID_PAGINATION quando os valores não são inteiros dentro do intervalo permitido.
 */
export function parsePaginacao(query: { limite?: unknown; deslocamento?: unknown }): Paginacao {
  const limite = lerInteiro(query.limite, HISTORICO_LIMITE_PADRAO);
  const deslocamento = lerInteiro(query.deslocamento, 0);
  if (limite < 1 || limite > HISTORICO_LIMITE_MAXIMO || deslocamento > 100_000) {
    throw new Error('INVALID_PAGINATION');
  }
  return { limite, deslocamento };
}

export function arredondarMoeda(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface ItemCalculavel {
  quantidade: number;
  preco_unitario: number;
}

/** Subtotal de uma linha da nota, arredondado a centavos. */
export function subtotalItem(item: ItemCalculavel): number {
  return arredondarMoeda(item.quantidade * item.preco_unitario);
}

/** Total da nota: soma dos subtotais por linha (a nota não guarda total próprio). */
export function totalDaNota(itens: ItemCalculavel[]): number {
  return arredondarMoeda(itens.reduce((soma, item) => soma + subtotalItem(item), 0));
}
