import { processarHtmlSefazManual } from '../services/sefazService';
import { pool } from '../database';

// HTML simulado de uma NFC-e real da SEFAZ
const htmlMockSefaz = `
<html>
  <body>
    <div id="u20">SUPERMERCADO AUTOMATIZADO TESTE</div>
    <div class="text">CNPJ: 12.345.678/0001-99</div>
    <div class="text">AVENIDA DOS TESTES, 1000 - SAO PAULO</div>
    <div>Emissão: 15/10/2026 14:30:00</div>
    
    <table id="tabResult">
      <tr class="item">
        <td class="txtTit">CHOCOLATE LACTA 90G</td>
        <td class="Rqtd">UN: 3</td>
        <td class="RUN">UN</td>
        <td class="RCod">7891000123456</td>
        <td class="RvlUnit">4,99</td>
      </tr>
      <tr class="item">
        <td class="txtTit">CAFE EM PO 500G</td>
        <td class="Rqtd">UN: 1</td>
        <td class="RUN">UN</td>
        <td class="RCod">7892000654321</td>
        <td class="RvlUnit">18,50</td>
      </tr>
    </table>

    <div id="totalNota">
      Valor a pagar R$: 33,47
    </div>
  </body>
</html>
`;

describe('SefazService - Teste de Integração (HTML Manual & Batch Insert)', () => {
  let idContaTeste: number;
  let idUsuarioTeste: number;
  let idNotaTeste: number;

  beforeAll(async () => {
    // 1. Cria a conta primeiro (onde ficam email, senha, nome, cep, etc.)
    const resConta = await pool.query(
      `INSERT INTO conta (email, senha, nome, cep, tipo_conta, status_conta, notificacoes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id_conta`,
      [
        `jayne.teste_${Date.now()}@hotmail.com`,
        '$2b$10$8V0X2Nn7miVivxD3zAUJ6emaBzsfX96N9KzYj/iXHM0SBzXj9uSZq',
        'Jayne Silva',
        '14800000',
        'USER',
        true,
        true
      ]
    );
    idContaTeste = resConta.rows[0].id_conta;

    // 2. Cria o usuário vinculado à conta criada
    const resUsuario = await pool.query(
      `INSERT INTO usuario (id_conta, aceita_lgpd) 
       VALUES ($1, $2) 
       RETURNING id_usuario`,
      [idContaTeste, true]
    );
    idUsuarioTeste = resUsuario.rows[0].id_usuario;

    // 3. Cria a nota fiscal de teste associada a esse usuário
    const resNota = await pool.query(
      `INSERT INTO nota_fiscal (id_usuario, status, valor_total, data_compra)
       VALUES ($1, 'CONTINGENCIA', 0, NOW()) RETURNING id_nota`,
      [idUsuarioTeste]
    );
    idNotaTeste = resNota.rows[0].id_nota;
  });

  afterAll(async () => {
    // Limpeza rigorosa do banco respeitando as chaves estrangeiras
    if (idNotaTeste) {
      await pool.query('DELETE FROM nota_item WHERE id_nota = $1', [idNotaTeste]);
      await pool.query('DELETE FROM nota_fiscal WHERE id_nota = $1', [idNotaTeste]);
    }
    if (idUsuarioTeste) {
      await pool.query('DELETE FROM usuario WHERE id_usuario = $1', [idUsuarioTeste]);
    }
    if (idContaTeste) {
      await pool.query('DELETE FROM conta WHERE id_conta = $1', [idContaTeste]);
    }
    await pool.end();
  });

  it('deve processar o HTML com sucesso, executar upsert de produtos, batch insert e atualizar a nota', async () => {
    const resultado = await processarHtmlSefazManual(
      htmlMockSefaz,
      idUsuarioTeste,
      idNotaTeste
    );

    // Validações do objeto retornado
    expect(resultado.sucesso).toBe(true);
    expect(resultado.supermercado).toBe('SUPERMERCADO AUTOMATIZADO TESTE');
    expect(resultado.produtos_salvos).toBe(2);
    expect(resultado.valor_total).toBe(33.47);
    expect(resultado.produtos).toContain('CHOCOLATE LACTA 90G');
    expect(resultado.produtos).toContain('CAFE EM PO 500G');

    // Validação de banco: verifica se os itens foram gravados via batch insert
    const itensNoBanco = await pool.query(
      'SELECT * FROM nota_item WHERE id_nota = $1 ORDER BY valor_unitario DESC',
      [idNotaTeste]
    );

    expect(itensNoBanco.rows.length).toBe(2);
    expect(Number(itensNoBanco.rows[0].valor_unitario)).toBe(18.50);
    expect(Number(itensNoBanco.rows[1].valor_unitario)).toBe(4.99);

    // Validação de banco: verifica se a nota foi atualizada para PROCESSADA
    const notaNoBanco = await pool.query(
      'SELECT status, valor_total FROM nota_fiscal WHERE id_nota = $1',
      [idNotaTeste]
    );

    expect(notaNoBanco.rows[0].status).toBe('PROCESSADA');
    expect(Number(notaNoBanco.rows[0].valor_total)).toBe(33.47);
  });
});