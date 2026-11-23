import assert from 'node:assert/strict';
import test from 'node:test';
import { limiteSeguro, padraoBuscaParcial } from './consulta';

test('padraoBuscaParcial trata curingas digitados como texto literal', () => {
  assert.equal(padraoBuscaParcial('arroz'), '%arroz%');
  assert.equal(padraoBuscaParcial('100%'), '%100\\%%');
  assert.equal(padraoBuscaParcial('a_b'), '%a\\_b%');
  assert.equal(padraoBuscaParcial('c:\\x'), '%c:\\\\x%');
});

test('limiteSeguro normaliza valores fracionários, inválidos e fora do intervalo', () => {
  assert.equal(limiteSeguro(undefined, 20), 20);
  assert.equal(limiteSeguro('abc', 20), 20);
  assert.equal(limiteSeguro(Number.NaN, 50), 50);
  assert.equal(limiteSeguro('2.5', 20), 2);
  assert.equal(limiteSeguro(0, 20), 1);
  assert.equal(limiteSeguro(1000, 20), 100);
  assert.equal(limiteSeguro('30', 20), 30);
});
