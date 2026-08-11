import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidCnpj, onlyDigits } from './brDocuments';

test('isValidCnpj valida dígitos verificadores', () => {
  assert.equal(isValidCnpj('11.222.333/0001-81'), true);
  assert.equal(isValidCnpj('11.111.111/0001-11'), false);
  assert.equal(isValidCnpj('00000000000000'), false);
});

test('onlyDigits normaliza documento formatado', () => {
  assert.equal(onlyDigits('11.222.333/0001-81'), '11222333000181');
});
