import assert from 'node:assert/strict';
import test from 'node:test';

process.env.JWT_SECRET ??= 'test-secret-with-at-least-32-characters';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/econoway';

test('bloqueia enderecos privados e especiais', async () => {
  const { isBlockedNetworkAddress } = await import('./nfceUrlPolicy');
  assert.equal(isBlockedNetworkAddress('127.0.0.1'), true);
  assert.equal(isBlockedNetworkAddress('10.1.2.3'), true);
  assert.equal(isBlockedNetworkAddress('192.168.1.5'), true);
  assert.equal(isBlockedNetworkAddress('169.254.169.254'), true);
  assert.equal(isBlockedNetworkAddress('8.8.8.8'), false);
});

test('aceita somente HTTPS nos hosts NFC-e explicitamente permitidos', async () => {
  const { validateNfceUrlShape } = await import('./nfceUrlPolicy');

  const valid = validateNfceUrlShape(
    'https://www.nfce.fazenda.sp.gov.br/qrcode?p=teste',
  );
  assert.equal(valid.protocol, 'https:');

  assert.throws(
    () => validateNfceUrlShape('http://www.nfce.fazenda.sp.gov.br/qrcode?p=teste'),
    /NFCE_URL_PROTOCOL/,
  );
  assert.throws(
    () => validateNfceUrlShape('https://example.com/qrcode?p=teste'),
    /NFCE_URL_HOST/,
  );
});
