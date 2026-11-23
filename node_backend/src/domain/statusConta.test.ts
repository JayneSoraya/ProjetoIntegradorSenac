import assert from 'node:assert/strict';
import test from 'node:test';
import { CacheStatusConta } from './statusConta';

test('CacheStatusConta expira entradas após o TTL', () => {
  let agora = 1_000;
  const cache = new CacheStatusConta(30_000, () => agora);

  assert.equal(cache.obter(1), undefined);
  cache.guardar(1, { ativa: true, perfil: 'USUARIO' });
  assert.deepEqual(cache.obter(1), { ativa: true, perfil: 'USUARIO' });

  agora += 30_000;
  assert.equal(cache.obter(1), undefined);
});

test('CacheStatusConta guarda conta inexistente e permite invalidar', () => {
  const cache = new CacheStatusConta(30_000, () => 0);
  cache.guardar(7, null);
  assert.equal(cache.obter(7), null);

  cache.guardar(8, { ativa: true, perfil: 'ADMIN' });
  cache.invalidar(8);
  assert.equal(cache.obter(8), undefined);
});

test('CacheStatusConta não cresce além da capacidade', () => {
  const cache = new CacheStatusConta(30_000, () => 0, 2);
  cache.guardar(1, null);
  cache.guardar(2, null);
  cache.guardar(3, null);
  assert.equal(cache.obter(3), null);
  assert.equal(cache.obter(1), undefined);
});
