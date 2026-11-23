import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePriceImport } from './priceImport';

test('validatePriceImport normaliza aliases e vírgula decimal', () => {
  const result = validatePriceImport([
    {
      codigo_produto: '001',
      nome_produto: 'Arroz',
      ean: '789000000001',
      preco: '24,90',
      preco_fidelidade: '23,50',
      unidade: '5kg',
    },
  ]);

  assert.equal(result.erros.length, 0);
  assert.equal(result.validos[0].preco, 24.9);
  assert.equal(result.validos[0].precoFidelidade, 23.5);
  assert.equal(result.checksum.length, 64);
});

test('validatePriceImport rejeita código duplicado no mesmo arquivo', () => {
  const result = validatePriceImport([
    { ean: '123', nome: 'A', preco: 10 },
    { ean: '123', nome: 'B', preco: 11 },
  ]);
  assert.equal(result.validos.length, 1);
  assert.equal(result.erros[0].codigo, 'CODIGO_DUPLICADO');
});

test('validatePriceImport rejeita preço inválido', () => {
  const result = validatePriceImport([{ ean: '123', nome: 'A', preco: -1 }]);
  assert.equal(result.validos.length, 0);
  assert.equal(result.erros[0].codigo, 'PRECO_INVALIDO');
});
