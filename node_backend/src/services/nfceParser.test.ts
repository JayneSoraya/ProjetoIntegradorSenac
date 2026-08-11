import assert from 'node:assert/strict';
import test from 'node:test';
import { extractNfceAccessKey, parseBrazilianNumber, parseNfceHtml } from './nfceParser';

test('parseBrazilianNumber interpreta formato brasileiro sem aceitar lixo vazio', () => {
  assert.equal(parseBrazilianNumber('Vl. Unit.: 1.234,56'), 1234.56);
  assert.equal(parseBrazilianNumber('Qtd.: 2,5000'), 2.5);
  assert.equal(parseBrazilianNumber(''), null);
});

test('parseNfceHtml extrai emitente, CNPJ e itens do shape SEFAZ suportado', () => {
  const html = `
    <html><body>
      <div id="u20">Mercado Exemplo</div>
      <div class="text">CNPJ: 11.222.333/0001-81</div>
      <div class="text">RUA TESTE, 100</div>
      <table id="tabResult"><tr>
        <td class="txtTit">Arroz 5kg</td>
        <td class="RCod">(Código: 7891234567890)</td>
        <td class="Rqtd">Qtd.: 2,0000</td>
        <td class="RvlUnit">Vl. Unit.: 24,90</td>
      </tr></table>
    </body></html>`;

  const parsed = parseNfceHtml(html);
  assert.equal(parsed.nomeEmitente, 'Mercado Exemplo');
  assert.equal(parsed.cnpj, '11222333000181');
  assert.equal(parsed.endereco, 'RUA TESTE, 100');
  assert.deepEqual(parsed.itens, [{ nome: 'Arroz 5kg', codigo: '7891234567890', preco: 24.9, quantidade: 2 }]);
});

test('extractNfceAccessKey localiza chave de 44 dígitos na URL', () => {
  const key = '35260811222333000181650010000000011000000010';
  const url = new URL(`https://www.nfce.fazenda.sp.gov.br/qrcode?p=${key}|2|1|ABC`);
  assert.equal(extractNfceAccessKey(url, '<html></html>'), key);
});
