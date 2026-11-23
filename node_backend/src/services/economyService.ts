import { pool } from '../database';

export interface EconomySummary {
  economia_mes: number;
  economia_total: number;
  economia_potencial: number;
  mercado_mais_barato: string | null;
  total_comparacoes: number;
  econo_coins: number;
  total_notas_validas: number;
  econo_coins_status: 'ATIVO';
  mapa: {
    produtos_com_preco: number;
    meta: number;
    progresso: number;
  };
}

export class EconomyService {
  static async buscarResumo(userId: number): Promise<EconomySummary> {
    const [totals, latest, favoriteMarket, progress, contribution] = await Promise.all([
      pool.query<{
        economia_mes: number | string;
        economia_total: number | string;
        total_comparacoes: number | string;
      }>(
        `SELECT
           COALESCE(SUM(c.economia_potencial) FILTER (
             WHERE DATE_TRUNC('month', c.data_comparacao) = DATE_TRUNC('month', NOW())
           ), 0) AS economia_mes,
           COALESCE(SUM(c.economia_potencial), 0) AS economia_total,
           COUNT(c.id_comparacao) AS total_comparacoes
         FROM carrinho ca
         LEFT JOIN comparacao c ON c.id_carrinho = ca.id_carrinho
         WHERE ca.id_usuario = $1`,
        [userId],
      ),
      pool.query<{ economia_potencial: number | string; nome_supermercado_mais_barato: string | null }>(
        `SELECT c.economia_potencial, c.nome_supermercado_mais_barato
         FROM comparacao c
         INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
         WHERE ca.id_usuario = $1
         ORDER BY c.data_comparacao DESC
         LIMIT 1`,
        [userId],
      ),
      pool.query<{ nome_supermercado_mais_barato: string }>(
        `SELECT c.nome_supermercado_mais_barato, COUNT(*) AS vezes
         FROM comparacao c
         INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
         WHERE ca.id_usuario = $1
           AND c.nome_supermercado_mais_barato IS NOT NULL
         GROUP BY c.nome_supermercado_mais_barato
         ORDER BY vezes DESC
         LIMIT 1`,
        [userId],
      ),
      pool.query<{ produtos_com_preco: number | string }>(
        `SELECT COUNT(DISTINCT o.id_produto) AS produtos_com_preco
         FROM oferta_supermercado o
         INNER JOIN supermercado s ON s.id_supermercado = o.id_supermercado
         WHERE s.status_cadastro = 'APROVADO'`,
      ),
      pool.query<{ saldo: number | string; total_notas_validas: number | string }>(
        `SELECT
           (SELECT COALESCE(SUM(pontos), 0) FROM econocoin_evento WHERE id_usuario = $1) AS saldo,
           (SELECT COUNT(*) FROM nota_fiscal WHERE id_usuario = $1 AND status = 'VALIDA') AS total_notas_validas`,
        [userId],
      ),
    ]);

    const row = totals.rows[0];
    const productsWithPrice = Number(progress.rows[0]?.produtos_com_preco ?? 0);
    const target = 50;
    const latestRow = latest.rows[0];
    const contributionRow = contribution.rows[0];

    return {
      economia_mes: Number(row?.economia_mes ?? 0),
      economia_total: Number(row?.economia_total ?? 0),
      economia_potencial: Number(latestRow?.economia_potencial ?? 0),
      mercado_mais_barato:
        favoriteMarket.rows[0]?.nome_supermercado_mais_barato
        ?? latestRow?.nome_supermercado_mais_barato
        ?? null,
      total_comparacoes: Number(row?.total_comparacoes ?? 0),
      econo_coins: Number(contributionRow?.saldo ?? 0),
      total_notas_validas: Number(contributionRow?.total_notas_validas ?? 0),
      econo_coins_status: 'ATIVO',
      mapa: {
        produtos_com_preco: productsWithPrice,
        meta: target,
        progresso: Math.min(productsWithPrice / target, 1),
      },
    };
  }
}
