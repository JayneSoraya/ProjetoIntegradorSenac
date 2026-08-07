import { pool } from "../database";

export class ProdutoRepository {

  static async buscar(termo: string) {
    const result = await pool.query(
      `
      SELECT 
        p.id_produto,
        p.nome_produto,
        p.marca,
        p.categoria,
        o.preco_atual AS preco,
        s.nome_fantasia AS supermercado
      FROM produto p
      JOIN oferta_supermercado o 
        ON o.id_produto = p.id_produto
      JOIN supermercado s 
        ON s.id_supermercado = o.id_supermercado
      WHERE 
        LOWER(p.nome_produto) LIKE LOWER($1) OR
        LOWER(p.categoria) LIKE LOWER($1) OR
        p.codigo_barras = $2
      `,
      [`%${termo}%`, termo]
    );

    return result.rows;
  }

  static async buscarDetalhe(id: number) {
    const result = await pool.query(
      `
      SELECT 
        p.id_produto,
        p.nome_produto,
        p.marca,
        p.categoria,
        p.peso,
        AVG(o.preco_atual) AS preco_medio,
        MAX(o.preco_atual) - MIN(o.preco_atual) AS variacao_preco
      FROM produto p
      JOIN oferta_supermercado o 
        ON o.id_produto = p.id_produto
      WHERE p.id_produto = $1
      GROUP BY p.id_produto
      `,
      [id]
    );

    return result.rows[0];
  }
}