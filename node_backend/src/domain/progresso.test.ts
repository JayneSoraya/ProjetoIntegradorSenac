import assert from 'node:assert/strict';
import test from 'node:test';
import { calcularProgresso, META_NOTAS, META_PRODUTOS } from './progresso';

test('calcularProgresso sem contribuições incentiva a primeira nota', () => {
  const result = calcularProgresso({ notasImportadas: 0, produtosComPreco: 0, totalMercados: 0 });
  assert.equal(result.progresso, 0);
  assert.equal(result.notas_restantes, META_NOTAS);
  assert.equal(result.concluido, false);
  assert.match(result.mensagem_progresso, /primeira NFC-e/);
});

test('calcularProgresso pondera notas (80%) e produtos (20%)', () => {
  const result = calcularProgresso({ notasImportadas: 5, produtosComPreco: 25, totalMercados: 3 });
  assert.equal(result.progresso, 0.5);
  assert.equal(result.notas_restantes, 5);
  assert.equal(result.total_mercados, 3);
  assert.match(result.mensagem_progresso, /Faltam 5 notas/);
});

test('calcularProgresso usa singular quando falta uma nota', () => {
  const result = calcularProgresso({ notasImportadas: META_NOTAS - 1, produtosComPreco: 0, totalMercados: 1 });
  assert.match(result.mensagem_progresso, /Faltam 1 nota /);
});

test('calcularProgresso limita a 100% e marca meta concluída', () => {
  const result = calcularProgresso({ notasImportadas: 40, produtosComPreco: META_PRODUTOS * 3, totalMercados: 8 });
  assert.equal(result.progresso, 1);
  assert.equal(result.notas_restantes, 0);
  assert.equal(result.concluido, true);
});

test('calcularProgresso nunca comunica bloqueio de comparação', () => {
  for (const notas of [0, 3, 9, 10]) {
    const { mensagem_progresso } = calcularProgresso({ notasImportadas: notas, produtosComPreco: 0, totalMercados: 0 });
    assert.doesNotMatch(mensagem_progresso, /desbloquear|bloquead/i);
  }
});

test('calcularProgresso ignora entradas inválidas', () => {
  const result = calcularProgresso({ notasImportadas: -4, produtosComPreco: Number.NaN, totalMercados: -1 });
  assert.equal(result.notas_importadas, 0);
  assert.equal(result.produtos_com_preco, 0);
  assert.equal(result.total_mercados, 0);
  assert.equal(result.progresso, 0);
});
