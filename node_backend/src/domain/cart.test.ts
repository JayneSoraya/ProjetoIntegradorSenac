import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCartItems, normalizeMarketIds } from './cart';

test('normalizeCartItems consolida produtos repetidos', () => {
  const result = normalizeCartItems([
    { idProduto: 5, quantidade: 2 },
    { idProduto: 5, quantidade: 3 },
    { idProduto: 8, quantidade: 1 },
  ]);
  assert.deepEqual(result, [
    { idProduto: 5, quantidade: 5 },
    { idProduto: 8, quantidade: 1 },
  ]);
});

test('normalizeCartItems rejeita quantidade invalida', () => {
  assert.throws(() => normalizeCartItems([{ idProduto: 1, quantidade: 0 }]), /INVALID_ITEMS/);
});

test('normalizeMarketIds remove duplicados e valida ids', () => {
  assert.deepEqual(normalizeMarketIds([3, 3, 2]), [3, 2]);
  assert.throws(() => normalizeMarketIds([0]), /INVALID_MARKETS/);
});
