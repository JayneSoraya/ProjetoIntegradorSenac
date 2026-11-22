/**
 * Monta o padrão de busca parcial para ILIKE tratando os curingas digitados
 * pelo usuário (% e _) como texto literal (barra invertida é o escape padrão do PostgreSQL).
 */
export function padraoBuscaParcial(termo: string): string {
  const escapado = termo.replace(/[\\%_]/g, (caractere) => `\\${caractere}`);
  return `%${escapado}%`;
}

/**
 * Converte um limite vindo de query string em inteiro dentro do intervalo
 * permitido. Valores ausentes, fracionários ou inválidos usam o padrão.
 */
export function limiteSeguro(valor: unknown, padrao: number, minimo = 1, maximo = 100): number {
  const numero = typeof valor === 'number' ? valor : Number(valor);
  if (!Number.isFinite(numero)) return padrao;
  return Math.min(Math.max(Math.floor(numero), minimo), maximo);
}
