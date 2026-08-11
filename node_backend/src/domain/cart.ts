export interface CartItemInput {
  idProduto: number;
  quantidade: number;
}

export function normalizeCartItems(value: unknown, maxItems = 100): CartItemInput[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > maxItems) {
    throw new Error('INVALID_ITEMS');
  }

  const aggregated = new Map<number, number>();

  for (const raw of value) {
    if (!raw || typeof raw !== 'object') {
      throw new Error('INVALID_ITEMS');
    }

    const item = raw as Partial<CartItemInput>;
    const idProduto = Number(item.idProduto);
    const quantidade = Number(item.quantidade);

    if (!Number.isInteger(idProduto) || idProduto <= 0) {
      throw new Error('INVALID_ITEMS');
    }
    if (!Number.isInteger(quantidade) || quantidade <= 0 || quantidade > 1000) {
      throw new Error('INVALID_ITEMS');
    }

    const nextQuantity = (aggregated.get(idProduto) ?? 0) + quantidade;
    if (nextQuantity > 1000) {
      throw new Error('INVALID_ITEMS');
    }
    aggregated.set(idProduto, nextQuantity);
  }

  return [...aggregated.entries()].map(([idProduto, quantidade]) => ({ idProduto, quantidade }));
}

export function normalizeMarketIds(value: unknown, maxMarkets = 100): number[] {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > maxMarkets) {
    throw new Error('INVALID_MARKETS');
  }

  const ids = [...new Set(value.map(Number))];
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new Error('INVALID_MARKETS');
  }
  return ids;
}
