import { pool } from '../database';
export class HistoricoService {
    static async listarPorUsuario(idUsuario) {
        const resultado = await pool.query(`
      SELECT
        nf.id_nota,
        nf.data_compra,
        nf.valor_total,
        nf.chave_nfce,
        s.nome_fantasia   AS supermercado,
        s.endereco_completo,
        COUNT(ni.id_item) AS total_itens
      FROM nota_fiscal nf
      INNER JOIN supermercado s ON s.id_supermercado = nf.id_supermercado
      LEFT JOIN nota_item ni ON ni.id_nota = nf.id_nota
      WHERE nf.id_usuario = $1
      GROUP BY
        nf.id_nota,
        nf.data_compra,
        nf.valor_total,
        nf.chave_nfce,
        s.nome_fantasia,
        s.endereco_completo
      ORDER BY nf.data_compra DESC
      `, [idUsuario]);
        return resultado.rows;
    }
    static async detalharCompra(idNota, idUsuario) {
        const notaExiste = await pool.query(`SELECT id_nota FROM nota_fiscal WHERE id_nota = $1 AND id_usuario = $2`, [idNota, idUsuario]);
        if (notaExiste.rows.length === 0) {
            return null;
        }
        const cabecalho = await pool.query(`
      SELECT
        nf.id_nota,
        nf.data_compra,
        nf.valor_total,
        s.nome_fantasia AS supermercado,
        s.endereco_completo
      FROM nota_fiscal nf
      INNER JOIN supermercado s ON s.id_supermercado = nf.id_supermercado
      WHERE nf.id_nota = $1
      `, [idNota]);
        const itens = await pool.query(`
      SELECT
        ni.id_produto,
        p.nome_produto,
        p.categoria,
        ni.quantidade,
        ni.unidade,
        ni.valor_unitario,
        (ni.quantidade * ni.valor_unitario) AS subtotal
      FROM nota_item ni
      INNER JOIN produto p ON p.id_produto = ni.id_produto
      WHERE ni.id_nota = $1
      ORDER BY p.nome_produto
      `, [idNota]);
        return {
            nota: cabecalho.rows[0],
            itens: itens.rows,
        };
    }
    static async historicoPrecoProduto(idProduto) {
        const precoAtual = await pool.query(`
      SELECT
        s.nome_fantasia AS supermercado,
        o.preco_atual,
        o.data_atualizacao
      FROM oferta_supermercado o
      INNER JOIN supermercado s ON s.id_supermercado = o.id_supermercado
      WHERE o.id_produto = $1
      ORDER BY o.preco_atual ASC
      `, [idProduto]);
        const historico = await pool.query(`
      SELECT
        s.nome_fantasia AS supermercado,
        hp.preco,
        hp.registrado_em
      FROM historico_preco hp
      INNER JOIN supermercado s ON s.id_supermercado = hp.id_supermercado
      WHERE hp.id_produto = $1
      ORDER BY hp.registrado_em DESC
      LIMIT 50
      `, [idProduto]);
        const produto = await pool.query(`SELECT nome_produto, categoria FROM produto WHERE id_produto = $1`, [idProduto]);
        if (produto.rows.length === 0) {
            return null;
        }
        return {
            produto: produto.rows[0],
            precos_atuais: precoAtual.rows,
            historico: historico.rows,
        };
    }
    static async resumoEconomia(idUsuario) {
        const gastoMensal = await pool.query(`
      SELECT
        DATE_TRUNC('month', data_compra) AS mes,
        SUM(valor_total)                  AS total_gasto,
        COUNT(id_nota)                    AS total_compras
      FROM nota_fiscal
      WHERE id_usuario = $1
      GROUP BY mes
      ORDER BY mes DESC
      LIMIT 6
      `, [idUsuario]);
        const totalGeral = await pool.query(`SELECT COALESCE(SUM(valor_total), 0) AS total
       FROM nota_fiscal WHERE id_usuario = $1`, [idUsuario]);
        const favoritoResult = await pool.query(`
      SELECT s.nome_fantasia, COUNT(*) AS visitas
      FROM nota_fiscal nf
      INNER JOIN supermercado s ON s.id_supermercado = nf.id_supermercado
      WHERE nf.id_usuario = $1
      GROUP BY s.nome_fantasia
      ORDER BY visitas DESC
      LIMIT 1
      `, [idUsuario]);
        return {
            gasto_mensal: gastoMensal.rows,
            total_geral: parseFloat(totalGeral.rows[0].total),
            supermercado_favorito: favoritoResult.rows[0]?.nome_fantasia ?? null,
            total_notas: gastoMensal.rows.reduce((acc, row) => acc + parseInt(row.total_compras), 0),
        };
    }
}
