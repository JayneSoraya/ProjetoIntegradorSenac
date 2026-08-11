import { pool } from '../database';
import { CartItemInput } from '../domain/cart';
import { rankMarkets, roundCurrency, summarizeCompleteMarkets } from '../domain/comparison';
import { env } from '../config/env';

export interface MarketComparisonItem {
  idProduto: number;
  nomeProduto: string;
  quantidade: number;
  preco: number;
  precoFidelidade: number | null;
  atualizadoEm: string | null;
  desatualizado: boolean;
}

export interface MarketComparison {
  id_supermercado: number;
  nome_fantasia: string;
  total: number;
  total_fidelidade: number;
  total_itens: number;
  itens_encontrados: number;
  itens_faltando: number;
  itens_desatualizados: number;
  carrinho_completo: boolean;
  encontrados: MarketComparisonItem[];
  faltando: Array<{ idProduto: number; nomeProduto: string }>;
}

export interface ComparisonSummary {
  melhor_mercado_id: number | null;
  melhor_mercado: string | null;
  melhor_total: number;
  media_tres_mais_caros: number;
  economia_potencial: number;
  mercados_avaliados: number;
  mercados_completos: number;
  salvo: boolean;
  id_comparacao: number | null;
  itens_desatualizados_total: number;
}

export interface ComparisonResult {
  mercados: MarketComparison[];
  resumo: ComparisonSummary;
}


export class ComparisonService {
  static async compare(
    items: CartItemInput[],
    marketIds: number[],
    options: { save?: boolean; userId?: number; strategy?: string } = {},
  ): Promise<ComparisonResult> {
    const productIds = items.map((item) => item.idProduto);
    const productCount = await pool.query<{ total: number }>(
      'SELECT COUNT(*)::int AS total FROM produto WHERE id_produto = ANY($1::bigint[])',
      [productIds],
    );
    if ((productCount.rows[0]?.total ?? 0) !== productIds.length) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const values: string[] = [];
    const params: Array<number | number[]> = [];

    items.forEach((item, index) => {
      const base = index * 2;
      values.push(`($${base + 1}::bigint, $${base + 2}::int)`);
      params.push(item.idProduto, item.quantidade);
    });

    let marketFilter = '';
    if (marketIds.length) {
      params.push(marketIds);
      marketFilter = `AND s.id_supermercado = ANY($${params.length}::bigint[])`;
    }

    const result = await pool.query<{
      id_supermercado: number;
      nome_fantasia: string;
      id_produto: number;
      nome_produto: string | null;
      quantidade: number;
      preco_atual: string | null;
      preco_fidelidade: string | null;
      data_atualizacao: Date | null;
    }>(
      `WITH itens_requisitados (id_produto, quantidade) AS (
         VALUES ${values.join(', ')}
       ), mercados AS (
         SELECT s.id_supermercado, s.nome_fantasia
         FROM supermercado s
         WHERE s.status_cadastro = 'APROVADO'
         ${marketFilter}
       )
       SELECT
         m.id_supermercado,
         m.nome_fantasia,
         i.id_produto,
         p.nome_produto,
         i.quantidade,
         o.preco_atual,
         o.preco_fidelidade,
         o.data_atualizacao
       FROM mercados m
       CROSS JOIN itens_requisitados i
       LEFT JOIN produto p ON p.id_produto = i.id_produto
       LEFT JOIN oferta_supermercado o
         ON o.id_supermercado = m.id_supermercado
        AND o.id_produto = i.id_produto
       ORDER BY m.id_supermercado, i.id_produto`,
      params,
    );

    const byMarket = new Map<number, MarketComparison>();

    for (const row of result.rows) {
      let market = byMarket.get(row.id_supermercado);
      if (!market) {
        market = {
          id_supermercado: Number(row.id_supermercado),
          nome_fantasia: row.nome_fantasia,
          total: 0,
          total_fidelidade: 0,
          total_itens: items.length,
          itens_encontrados: 0,
          itens_faltando: 0,
          itens_desatualizados: 0,
          carrinho_completo: true,
          encontrados: [],
          faltando: [],
        };
        byMarket.set(row.id_supermercado, market);
      }

      if (row.preco_atual != null) {
        const price = Number(row.preco_atual);
        const loyaltyPrice = row.preco_fidelidade == null ? null : Number(row.preco_fidelidade);
        const updatedAt = row.data_atualizacao ? new Date(row.data_atualizacao) : null;
        const stale = !updatedAt || Date.now() - updatedAt.getTime() > env.priceFreshnessHours * 60 * 60 * 1000;
        market.total += price * row.quantidade;
        market.total_fidelidade += (loyaltyPrice ?? price) * row.quantidade;
        market.itens_encontrados += 1;
        if (stale) market.itens_desatualizados += 1;
        market.encontrados.push({
          idProduto: Number(row.id_produto),
          nomeProduto: row.nome_produto ?? 'Produto',
          quantidade: row.quantidade,
          preco: price,
          precoFidelidade: loyaltyPrice,
          atualizadoEm: updatedAt?.toISOString() ?? null,
          desatualizado: stale,
        });
      } else {
        market.carrinho_completo = false;
        market.itens_faltando += 1;
        market.faltando.push({
          idProduto: Number(row.id_produto),
          nomeProduto: row.nome_produto ?? 'Produto não cadastrado',
        });
      }
    }

    if (byMarket.size === 0) throw new Error('NO_MARKETS_AVAILABLE');

    const markets = rankMarkets(
      [...byMarket.values()].map((market) => ({
        ...market,
        total: roundCurrency(market.total),
        total_fidelidade: roundCurrency(market.total_fidelidade),
      })),
    );

    const { complete, best, expensiveAverage, potentialSavings } = summarizeCompleteMarkets(markets);
    const staleItemsTotal = markets.reduce((sum, market) => sum + market.itens_desatualizados, 0);

    let comparisonId: number | null = null;
    if (options.save) {
      if (!options.userId) throw new Error('USER_REQUIRED');
      if (!best) throw new Error('NO_COMPLETE_MARKET');
      comparisonId = await this.persist(
        options.userId,
        items,
        markets,
        best,
        expensiveAverage,
        potentialSavings,
        options.strategy ?? (marketIds.length ? 'SELECIONADOS' : 'MENOR_TOTAL'),
      );
    }

    return {
      mercados: markets,
      resumo: {
        melhor_mercado_id: best?.id_supermercado ?? null,
        melhor_mercado: best?.nome_fantasia ?? null,
        melhor_total: roundCurrency(best?.total ?? 0),
        media_tres_mais_caros: roundCurrency(expensiveAverage),
        economia_potencial: roundCurrency(potentialSavings),
        mercados_avaliados: markets.length,
        mercados_completos: complete.length,
        salvo: Boolean(comparisonId),
        id_comparacao: comparisonId,
        itens_desatualizados_total: staleItemsTotal,
      },
    };
  }

  private static async persist(
    userId: number,
    items: CartItemInput[],
    markets: MarketComparison[],
    best: MarketComparison,
    expensiveAverage: number,
    potentialSavings: number,
    strategy: string,
  ): Promise<number> {
    const allowedStrategies = new Set(['MENOR_TOTAL', 'FAVORITOS', 'PROXIMOS', 'SELECIONADOS']);
    const safeStrategy = allowedStrategies.has(strategy) ? strategy : 'MENOR_TOTAL';
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const cart = await client.query<{ id_carrinho: number }>(
        `INSERT INTO carrinho (id_usuario, status)
         VALUES ($1, 'COMPARADO')
         RETURNING id_carrinho`,
        [userId],
      );
      const cartId = cart.rows[0].id_carrinho;

      await client.query(
        `INSERT INTO item_carrinho (id_carrinho, id_produto, quantidade)
         SELECT $1, x.id_produto, x.quantidade
         FROM jsonb_to_recordset($2::jsonb) AS x(id_produto BIGINT, quantidade INTEGER)`,
        [cartId, JSON.stringify(items.map((item) => ({ id_produto: item.idProduto, quantidade: item.quantidade })))],
      );

      const comparison = await client.query<{ id_comparacao: number }>(
        `INSERT INTO comparacao (
           id_carrinho,
           valor_mercado_escolhido,
           nome_supermercado_mais_barato,
           lista_precos_concorrentes,
           valor_media_tres_mercados,
           economia_potencial,
           estrategia
         ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
         RETURNING id_comparacao`,
        [
          cartId,
          roundCurrency(best.total),
          best.nome_fantasia,
          JSON.stringify(markets),
          roundCurrency(expensiveAverage),
          roundCurrency(potentialSavings),
          safeStrategy,
        ],
      );

      await client.query('COMMIT');
      return comparison.rows[0].id_comparacao;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async history(userId: number, limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const result = await pool.query(
      `SELECT
         c.id_comparacao,
         c.data_comparacao,
         c.valor_mercado_escolhido,
         c.nome_supermercado_mais_barato,
         c.valor_media_tres_mercados,
         c.economia_potencial,
         c.estrategia,
         (SELECT COALESCE(SUM(ic.quantidade), 0) FROM item_carrinho ic WHERE ic.id_carrinho = ca.id_carrinho) AS total_itens
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       WHERE ca.id_usuario = $1
       ORDER BY c.data_comparacao DESC
       LIMIT $2`,
      [userId, safeLimit],
    );
    return result.rows;
  }

  static async detail(userId: number, comparisonId: number) {
    const result = await pool.query(
      `SELECT
         c.id_comparacao,
         c.data_comparacao,
         c.valor_mercado_escolhido,
         c.nome_supermercado_mais_barato,
         c.lista_precos_concorrentes,
         c.valor_media_tres_mercados,
         c.economia_potencial,
         c.estrategia,
         json_agg(
           json_build_object(
             'id_produto', ic.id_produto,
             'nome_produto', p.nome_produto,
             'quantidade', ic.quantidade
           ) ORDER BY p.nome_produto
         ) AS itens
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       INNER JOIN item_carrinho ic ON ic.id_carrinho = ca.id_carrinho
       INNER JOIN produto p ON p.id_produto = ic.id_produto
       WHERE ca.id_usuario = $1 AND c.id_comparacao = $2
       GROUP BY c.id_comparacao
       LIMIT 1`,
      [userId, comparisonId],
    );
    return result.rows[0] ?? null;
  }
}
