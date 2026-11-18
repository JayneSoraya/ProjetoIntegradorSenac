import { pool } from '../database';

export class ComparacaoRepository {
  static async listarMercados() {
    return pool.query(`
      SELECT
        id_supermercado,
        nome_fantasia
      FROM supermercado
    `);
  }

  static async buscarOferta(idSupermercado: number, idProduto: number) {
    return pool.query(
      `
      SELECT
        p.nome_produto,
        o.preco_atual
      FROM oferta_supermercado o
      INNER JOIN produto p
        ON p.id_produto = o.id_produto
      WHERE
        o.id_supermercado = $1
        AND o.id_produto = $2
      `,
      [idSupermercado, idProduto],
    );
  }

  static async buscarProduto(idProduto: number) {
    return pool.query(
      `
      SELECT nome_produto
      FROM produto
      WHERE id_produto = $1
      `,
      [idProduto],
    );
  }

  static async buscarOfertasMercado(
  idSupermercado: number,
  produtos: number[],
) {

  return pool.query(
    `
    SELECT
      p.id_produto,
      p.nome_produto,
      o.preco_atual
    FROM oferta_supermercado o
    INNER JOIN produto p
      ON p.id_produto = o.id_produto
    WHERE
      o.id_supermercado = $1
      AND o.id_produto = ANY($2)
    `,
    [
      idSupermercado,
      produtos,
    ],
  );
}
}