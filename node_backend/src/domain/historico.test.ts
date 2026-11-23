import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HISTORICO_LIMITE_MAXIMO,
  HISTORICO_LIMITE_PADRAO,
  parsePaginacao,
  parseResourceId,
  subtotalItem,
  totalDaNota,
} from './historico';

test('parseResourceId aceita apenas inteiros positivos em texto', () => {
  assert.equal(parseResourceId('42'), 42);
  assert.equal(parseResourceId('0'), null);
  assert.equal(parseResourceId('-3'), null);
  assert.equal(parseResourceId('1.5'), null);
  assert.equal(parseResourceId('12abc'), null);
  assert.equal(parseResourceId(''), null);
  assert.equal(parseResourceId(undefined), null);
  assert.equal(parseResourceId(['7']), null);
  assert.equal(parseResourceId('9'.repeat(20)), null);
});

test('parsePaginacao usa padrões quando nada é informado', () => {
  assert.deepEqual(parsePaginacao({}), { limite: HISTORICO_LIMITE_PADRAO, deslocamento: 0 });
});

test('parsePaginacao aceita valores válidos e rejeita inválidos', () => {
  assert.deepEqual(parsePaginacao({ limite: '10', deslocamento: '20' }), { limite: 10, deslocamento: 20 });
  assert.equal(parsePaginacao({ limite: String(HISTORICO_LIMITE_MAXIMO) }).limite, HISTORICO_LIMITE_MAXIMO);
  assert.throws(() => parsePaginacao({ limite: '0' }), /INVALID_PAGINATION/);
  assert.throws(() => parsePaginacao({ limite: String(HISTORICO_LIMITE_MAXIMO + 1) }), /INVALID_PAGINATION/);
  assert.throws(() => parsePaginacao({ limite: '-1' }), /INVALID_PAGINATION/);
  assert.throws(() => parsePaginacao({ deslocamento: 'abc' }), /INVALID_PAGINATION/);
  assert.throws(() => parsePaginacao({ limite: ['1', '2'] }), /INVALID_PAGINATION/);
});

test('totalDaNota soma subtotais com arredondamento em centavos', () => {
  assert.equal(subtotalItem({ quantidade: 3, preco_unitario: 1.1 }), 3.3);
  assert.equal(subtotalItem({ quantidade: 0.355, preco_unitario: 19.9 }), 7.06);
  assert.equal(
    totalDaNota([
      { quantidade: 2, preco_unitario: 4.5 },
      { quantidade: 0.5, preco_unitario: 10.99 },
    ]),
    14.5,
  );
  assert.equal(totalDaNota([]), 0);
});
