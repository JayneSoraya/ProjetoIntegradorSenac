import { pool } from '../database';

export class EconomiaRepository {

  static async buscarEconomiaMes(
    idUsuario: number,
  ) {
    return pool.query(
      `
      SELECT
        COALESCE(
          SUM(c.economia_potencial),
          0
        ) AS total
      FROM comparacao c
      INNER JOIN carrinho ca
        ON ca.id_carrinho =
           c.id_carrinho
      WHERE
        ca.id_usuario = $1
        AND DATE_TRUNC(
          'month',
          c.data_comparacao
        ) =
        DATE_TRUNC(
          'month',
          NOW()
        )
      `,
      [idUsuario],
    );
  }

  static async buscarUltimaComparacao(
    idUsuario: number,
  ) {
    return pool.query(
      `
      SELECT
        c.economia_potencial,
        c.nome_supermercado_mais_barato,
        c.data_comparacao
      FROM comparacao c
      INNER JOIN carrinho ca
        ON ca.id_carrinho =
           c.id_carrinho
      WHERE
        ca.id_usuario = $1
      ORDER BY
        c.data_comparacao DESC
      LIMIT 1
      `,
      [idUsuario],
    );
  }

  static async buscarTotalComparacoes(
    idUsuario: number,
  ) {
    return pool.query(
      `
      SELECT COUNT(*) AS total
      FROM comparacao c
      INNER JOIN carrinho ca
        ON ca.id_carrinho =
           c.id_carrinho
      WHERE
        ca.id_usuario = $1
      `,
      [idUsuario],
    );
  }

  static async buscarMercadoMaisBarato(
    idUsuario: number,
  ) {
    return pool.query(
      `
      SELECT
        c.nome_supermercado_mais_barato,
        COUNT(*) AS vezes
      FROM comparacao c
      INNER JOIN carrinho ca
        ON ca.id_carrinho =
           c.id_carrinho
      WHERE
        ca.id_usuario = $1
      GROUP BY
        c.nome_supermercado_mais_barato
      ORDER BY
        vezes DESC
      LIMIT 1
      `,
      [idUsuario],
    );
  }

  static async buscarEconomiaTotal(
    idUsuario: number,
  ) {
    return pool.query(
      `
      SELECT
        COALESCE(
          SUM(c.economia_potencial),
          0
        ) AS total
      FROM comparacao c
      INNER JOIN carrinho ca
        ON ca.id_carrinho =
           c.id_carrinho
      WHERE
        ca.id_usuario = $1
      `,
      [idUsuario],
    );
  }

  static async buscarProgressoMapa() {
    return pool.query(
      `
      SELECT
        COUNT(
          DISTINCT id_produto
        ) AS produtos_com_preco
      FROM oferta_supermercado
      `
    );
  }
}
