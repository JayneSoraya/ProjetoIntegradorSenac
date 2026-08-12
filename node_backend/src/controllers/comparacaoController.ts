import { Request, Response } from 'express';
import { pool } from '../database';

export class ComparacaoController {

  comparar = async (
    req: Request,
    res: Response,
  ): Promise<void> => {

    try {

      const { itens } = req.body;

      if (!itens || itens.length === 0) {
        res.status(400).json({
          erro: 'Carrinho vazio.',
        });
        return;
      }

      const supermercados = await pool.query(`
        SELECT
          id_supermercado,
          nome_fantasia
        FROM supermercado
      `);

      const resultado = [];

      for (const mercado of supermercados.rows) {

        let total = 0;

        const encontrados = [];
        const faltando = [];

        for (const item of itens) {

          const oferta = await pool.query(
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
            [
              mercado.id_supermercado,
              item.idProduto,
            ],
          );

          if (oferta.rows.length > 0) {

            const preco =
              Number(
                oferta.rows[0].preco_atual,
              );

            total +=
              preco *
              item.quantidade;

            encontrados.push({
              idProduto:
                item.idProduto,
              nomeProduto:
                oferta.rows[0].nome_produto,
              quantidade:
                item.quantidade,
              preco,
            });

          } else {

            const produto =
              await pool.query(
                `
                SELECT nome_produto
                FROM produto
                WHERE id_produto = $1
                `,
                [item.idProduto],
              );

            faltando.push({
              idProduto:
                item.idProduto,
              nomeProduto:
                produto.rows[0]
                  ?.nome_produto ??
                'Produto',
            });
          }
        }

        resultado.push({
          id_supermercado:
            mercado.id_supermercado,

          nome_fantasia:
            mercado.nome_fantasia,

          total,

          total_itens:
            itens.length,

          itens_encontrados:
            encontrados.length,

          itens_faltando:
            faltando.length,

          carrinho_completo:
            faltando.length === 0,

          encontrados,

          faltando,
        });
      }

      resultado.sort((a, b) => {

        if (
          a.carrinho_completo &&
          !b.carrinho_completo
        ) {
          return -1;
        }

        if (
          !a.carrinho_completo &&
          b.carrinho_completo
        ) {
          return 1;
        }

        return a.total - b.total;
      });

      res.status(200).json(resultado);

    } catch (erro) {

      console.error(erro);

      res.status(500).json({
        erro: 'Erro ao comparar mercados.',
      });
    }
  };
}