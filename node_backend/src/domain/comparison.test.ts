import assert from 'node:assert/strict';
import test from 'node:test';
import { rankMarkets, roundCurrency, summarizeCompleteMarkets } from './comparison';

test('rankMarkets prioriza cesta completa e menor total', () => {
  const ranked = rankMarkets([
    { id_supermercado: 1, nome_fantasia: 'Parcial', total: 20, carrinho_completo: false, itens_encontrados: 1 },
    { id_supermercado: 2, nome_fantasia: 'Completo caro', total: 150, carrinho_completo: true, itens_encontrados: 3 },
    { id_supermercado: 3, nome_fantasia: 'Completo barato', total: 120, carrinho_completo: true, itens_encontrados: 3 },
  ]);

  assert.deepEqual(ranked.map((item) => item.id_supermercado), [3, 2, 1]);
});

test('summarizeCompleteMarkets usa media de ate tres mercados completos mais caros', () => {
  const markets = rankMarkets([
    { id_supermercado: 1, nome_fantasia: 'A', total: 100, carrinho_completo: true, itens_encontrados: 2 },
    { id_supermercado: 2, nome_fantasia: 'B', total: 120, carrinho_completo: true, itens_encontrados: 2 },
    { id_supermercado: 3, nome_fantasia: 'C', total: 140, carrinho_completo: true, itens_encontrados: 2 },
    { id_supermercado: 4, nome_fantasia: 'D', total: 160, carrinho_completo: true, itens_encontrados: 2 },
  ]);
  const summary = summarizeCompleteMarkets(markets);

  assert.equal(summary.best?.id_supermercado, 1);
  assert.equal(summary.expensiveAverage, 140);
  assert.equal(summary.potentialSavings, 40);
  assert.equal(roundCurrency(10.005), 10.01);
});
