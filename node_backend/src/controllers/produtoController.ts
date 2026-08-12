import { Request, Response } from 'express';
import { pool } from '../database';

export class ProdutoController {

  // RF05 — Busca por nome/marca e categoria
  buscar = async (req: Request, res: Response) => {
    const { busca, categoria } = req.query;

    try {
      let sql = `
        SELECT
          p.id_produto,
          p.codigo_barras,
          p.nome_produto,
          p.marca,
          p.categoria,
          p.peso,
          p.unidade_medida,
          MIN(o.preco_atual)                         AS preco,
          AVG(o.preco_atual)                         AS preco_medio,
          MAX(o.preco_atual) - MIN(o.preco_atual)    AS variacao_preco
        FROM produto p
        LEFT JOIN oferta_supermercado o ON o.id_produto = p.id_produto
        WHERE 1=1
      `;

      const params: string[] = [];
      let i = 1;

      if (busca) {
        sql += ` AND (
          LOWER(p.nome_produto) LIKE LOWER($${i})
          OR LOWER(p.marca)     LIKE LOWER($${i})
        )`;
        params.push(`%${busca}%`);
        i++;
      }

      if (categoria && categoria !== 'Todos') {
        sql += ` AND p.categoria = $${i}`;
        params.push(categoria as string);
        i++;
      }

      sql += `
        GROUP BY
          p.id_produto,
          p.codigo_barras,
          p.nome_produto,
          p.marca,
          p.categoria,
          p.peso,
          p.unidade_medida
        ORDER BY p.nome_produto ASC
        LIMIT 50
      `;

      const resultado = await pool.query(sql, params);
      return res.status(200).json(resultado.rows);

    } catch (erro) {
      console.error('❌ Erro ao buscar produtos:', erro);
      return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
    }
  };

  // RF07 — Detalhe do produto por ID
  buscarDetalhe = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const resultado = await pool.query(
        `SELECT
          p.id_produto,
          p.codigo_barras,
          p.nome_produto,
          p.marca,
          p.categoria,
          p.peso,
          p.unidade_medida,
          MIN(o.preco_atual)                         AS preco,
          AVG(o.preco_atual)                         AS preco_medio,
          MAX(o.preco_atual) - MIN(o.preco_atual)    AS variacao_preco
         FROM produto p
         LEFT JOIN oferta_supermercado o ON o.id_produto = p.id_produto
         WHERE p.id_produto = $1
         GROUP BY
           p.id_produto,
           p.codigo_barras,
           p.nome_produto,
           p.marca,
           p.categoria,
           p.peso,
           p.unidade_medida`,
        [id]
      );

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
      }

      return res.status(200).json(resultado.rows[0]);

    } catch (erro) {
      console.error('❌ Erro ao buscar detalhe:', erro);
      return res.status(500).json({ erro: 'Erro ao buscar produto.' });
    }
  };
}