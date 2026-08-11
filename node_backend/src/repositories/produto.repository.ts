import { pool } from '../database';

export class ProdutoRepository {
  static async buscar(termo: string, categoria: string) {
    const result = await pool.query(
      `SELECT
         p.id_produto,
         p.codigo_barras,
         p.nome_produto,
         p.marca,
         p.categoria,
         p.peso,
         p.unidade_medida,
         MIN(o.preco_atual) AS preco,
         AVG(o.preco_atual) AS preco_medio,
         MAX(o.preco_atual) - MIN(o.preco_atual) AS variacao_preco
       FROM produto p
       LEFT JOIN oferta_supermercado o ON o.id_produto = p.id_produto
         AND EXISTS (
           SELECT 1 FROM supermercado s
           WHERE s.id_supermercado = o.id_supermercado AND s.status_cadastro = 'APROVADO'
         )
       WHERE
         ($1 = '' OR p.nome_produto ILIKE $2 OR COALESCE(p.marca, '') ILIKE $2 OR p.codigo_barras = $1)
         AND ($3 = '' OR p.categoria = $3)
       GROUP BY
         p.id_produto,
         p.codigo_barras,
         p.nome_produto,
         p.marca,
         p.categoria,
         p.peso,
         p.unidade_medida
       ORDER BY p.nome_produto ASC
       LIMIT 50`,
      [termo, `%${termo}%`, categoria],
    );

    return result.rows;
  }

  static async buscarDetalhe(id: number) {
    const result = await pool.query(
      `SELECT
         p.id_produto,
         p.codigo_barras,
         p.nome_produto,
         p.marca,
         p.categoria,
         p.peso,
         p.unidade_medida,
         MIN(o.preco_atual) AS preco,
         AVG(o.preco_atual) AS preco_medio,
         MAX(o.preco_atual) - MIN(o.preco_atual) AS variacao_preco
       FROM produto p
       LEFT JOIN oferta_supermercado o ON o.id_produto = p.id_produto
         AND EXISTS (
           SELECT 1 FROM supermercado s
           WHERE s.id_supermercado = o.id_supermercado AND s.status_cadastro = 'APROVADO'
         )
       WHERE p.id_produto = $1
       GROUP BY
         p.id_produto,
         p.codigo_barras,
         p.nome_produto,
         p.marca,
         p.categoria,
         p.peso,
         p.unidade_medida`,
      [id],
    );

    return result.rows[0] ?? null;
  }
}
