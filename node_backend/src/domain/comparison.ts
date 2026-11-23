export interface ComparableMarket {
  id_supermercado: number;
  nome_fantasia: string;
  total: number;
  carrinho_completo: boolean;
  itens_encontrados: number;
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function rankMarkets<T extends ComparableMarket>(markets: T[]): T[] {
  return [...markets].sort((a, b) => {
    if (a.carrinho_completo !== b.carrinho_completo) {
      return a.carrinho_completo ? -1 : 1;
    }
    if (!a.carrinho_completo && a.itens_encontrados !== b.itens_encontrados) {
      return b.itens_encontrados - a.itens_encontrados;
    }
    return a.total - b.total;
  });
}

export function summarizeCompleteMarkets<T extends ComparableMarket>(markets: T[]) {
  const complete = markets.filter((market) => market.carrinho_completo);
  const best = complete[0] ?? null;
  const expensive = [...complete].sort((a, b) => b.total - a.total).slice(0, 3);
  const expensiveAverage = expensive.length
    ? expensive.reduce((sum, market) => sum + market.total, 0) / expensive.length
    : 0;
  const potentialSavings = best ? Math.max(0, expensiveAverage - best.total) : 0;

  return {
    complete,
    best,
    expensiveAverage: roundCurrency(expensiveAverage),
    potentialSavings: roundCurrency(potentialSavings),
  };
}
