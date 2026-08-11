import { pool } from '../database';
import { isValidCnpj, onlyDigits } from '../domain/brDocuments';
import { env } from '../config/env';

export interface NovoSupermercadoInput {
  cnpj: string;
  nome_fantasia: string;
  endereco_completo: string;
  latitude?: number | null;
  longitude?: number | null;
}


function finiteCoordinate(value: unknown, min: number, max: number): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) throw new Error('INVALID_COORDINATES');
  return parsed;
}

export class SupermercadoService {
  async cadastrar(dados: NovoSupermercadoInput) {
    const cnpj = onlyDigits(String(dados.cnpj ?? ''));
    const nomeFantasia = String(dados.nome_fantasia ?? '').trim();
    const enderecoCompleto = String(dados.endereco_completo ?? '').trim();
    const latitude = finiteCoordinate(dados.latitude, -90, 90);
    const longitude = finiteCoordinate(dados.longitude, -180, 180);

    if (!isValidCnpj(cnpj) || !nomeFantasia || !enderecoCompleto) {
      throw new Error('INVALID_MARKET');
    }

    const resultado = await pool.query(
      `INSERT INTO supermercado
         (cnpj, nome_fantasia, endereco_completo, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cnpj, nomeFantasia, enderecoCompleto, latitude, longitude],
    );

    return resultado.rows[0];
  }

  async listarTodos(options: {
    userId?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    somenteFavoritos?: boolean;
  } = {}) {
    let latitude = finiteCoordinate(options.latitude, -90, 90);
    let longitude = finiteCoordinate(options.longitude, -180, 180);
    const userId = options.userId ?? null;
    if ((latitude == null || longitude == null) && userId) {
      const storedLocation = await pool.query<{ latitude: number | null; longitude: number | null }>(
        'SELECT latitude, longitude FROM usuario WHERE id_usuario = $1 LIMIT 1',
        [userId],
      );
      const row = storedLocation.rows[0];
      if (row?.latitude != null && row.longitude != null) {
        latitude = Number(row.latitude);
        longitude = Number(row.longitude);
      }
    }
    const hasLocation = latitude != null && longitude != null;
    const onlyFavorites = options.somenteFavoritos === true;

    const resultado = await pool.query(
      `SELECT
         s.id_supermercado,
         s.cnpj,
         s.nome_fantasia,
         s.endereco_completo,
         s.latitude,
         s.longitude,
         s.reputacao_media,
         s.esta_aberto,
         s.status_cadastro,
         CASE
           WHEN $1::bigint IS NULL THEN FALSE
           ELSE EXISTS (
             SELECT 1 FROM favorito_supermercado f
             WHERE f.id_usuario = $1 AND f.id_supermercado = s.id_supermercado
           )
         END AS favorito,
         CASE
           WHEN $2::boolean AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL
           THEN 6371 * ACOS(
             LEAST(1, GREATEST(-1,
               COS(RADIANS($3::double precision)) * COS(RADIANS(s.latitude::double precision)) *
               COS(RADIANS(s.longitude::double precision) - RADIANS($4::double precision)) +
               SIN(RADIANS($3::double precision)) * SIN(RADIANS(s.latitude::double precision))
             ))
           )
           ELSE NULL
         END AS distancia_km
       FROM supermercado s
       WHERE s.status_cadastro = 'APROVADO'
         AND (
           $5::boolean = FALSE
           OR ($1::bigint IS NOT NULL AND EXISTS (
             SELECT 1 FROM favorito_supermercado f
             WHERE f.id_usuario = $1 AND f.id_supermercado = s.id_supermercado
           ))
         )
       ORDER BY favorito DESC, distancia_km ASC NULLS LAST, s.nome_fantasia ASC
       LIMIT 100`,
      [userId, hasLocation, latitude, longitude, onlyFavorites],
    );

    return resultado.rows.map((row) => ({
      ...row,
      reputacao_media: Number(row.reputacao_media ?? 0),
      distancia_km: row.distancia_km == null ? null : Number(Number(row.distancia_km).toFixed(2)),
    }));
  }

  async adicionarFavorito(userId: number, marketId: number): Promise<void> {
    const market = await pool.query('SELECT 1 FROM supermercado WHERE id_supermercado = $1 AND status_cadastro = \'APROVADO\'', [marketId]);
    if (!market.rowCount) throw new Error('MARKET_NOT_FOUND');
    await pool.query(
      `INSERT INTO favorito_supermercado (id_usuario, id_supermercado)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, marketId],
    );
  }

  async removerFavorito(userId: number, marketId: number): Promise<void> {
    await pool.query(
      'DELETE FROM favorito_supermercado WHERE id_usuario = $1 AND id_supermercado = $2',
      [userId, marketId],
    );
  }

  async mercadosDoResponsavel(accountId: number) {
    const result = await pool.query(
      `SELECT
         s.id_supermercado,
         s.cnpj,
         s.nome_fantasia,
         s.endereco_completo,
         s.status_cadastro,
         s.esta_aberto,
         sr.papel,
         sr.status AS status_vinculo,
         (SELECT COUNT(*) FROM oferta_supermercado o WHERE o.id_supermercado = s.id_supermercado) AS produtos_com_preco
       FROM supermercado_responsavel sr
       INNER JOIN supermercado s ON s.id_supermercado = sr.id_supermercado
       WHERE sr.id_conta = $1 AND sr.status = 'ATIVO'
       ORDER BY s.nome_fantasia`,
      [accountId],
    );
    return result.rows.map((row) => ({ ...row, produtos_com_preco: Number(row.produtos_com_preco) }));
  }

  async podeGerenciar(accountId: number, role: string, marketId: number): Promise<boolean> {
    if (role === 'ADMIN') return true;
    if (role !== 'SUPERMERCADO') return false;

    const result = await pool.query(
      `SELECT 1 FROM supermercado_responsavel
       WHERE id_conta = $1 AND id_supermercado = $2 AND status = 'ATIVO'
       LIMIT 1`,
      [accountId, marketId],
    );
    return Boolean(result.rowCount);
  }

  async listarProdutosOperacao(marketId: number, termo = '', page = 1, pageSize = 50) {
    const safeTerm = termo.trim().slice(0, 120);
    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.min(100, Math.max(10, Math.floor(pageSize)));
    const offset = (safePage - 1) * safePageSize;
    const params = [marketId, safeTerm, `%${safeTerm}%`];

    const [count, result] = await Promise.all([
      pool.query<{ total: number }>(
        `SELECT COUNT(*)::int AS total
         FROM supermercado_produto sp
         INNER JOIN produto p ON p.id_produto = sp.id_produto
         WHERE sp.id_supermercado = $1
           AND sp.ativo = TRUE
           AND ($2 = '' OR p.nome_produto ILIKE $3 OR p.codigo_barras = $2)`,
        params,
      ),
      pool.query(
        `SELECT
           p.id_produto,
           p.codigo_barras,
           p.nome_produto,
           p.marca,
           p.categoria,
           p.unidade_medida,
           o.preco_atual,
           o.preco_fidelidade,
           o.fonte,
           o.data_atualizacao
         FROM supermercado_produto sp
         INNER JOIN produto p ON p.id_produto = sp.id_produto
         LEFT JOIN oferta_supermercado o
           ON o.id_produto = p.id_produto AND o.id_supermercado = sp.id_supermercado
         WHERE sp.id_supermercado = $1
           AND sp.ativo = TRUE
           AND ($2 = '' OR p.nome_produto ILIKE $3 OR p.codigo_barras = $2)
         ORDER BY (o.preco_atual IS NULL) DESC, p.nome_produto, p.id_produto
         LIMIT $4 OFFSET $5`,
        [...params, safePageSize, offset],
      ),
    ]);

    const total = count.rows[0]?.total ?? 0;
    return {
      items: result.rows,
      pagination: {
        page: safePage,
        page_size: safePageSize,
        total,
        total_pages: Math.max(1, Math.ceil(total / safePageSize)),
      },
    };
  }


  async listarInconsistencias(
    marketId: number,
    type = '',
    page = 1,
    pageSize = 50,
  ) {
    const normalizedType = type.trim().toUpperCase();
    if (normalizedType && !['SEM_PRECO', 'PRECO_DESATUALIZADO', 'FIDELIDADE_MAIOR'].includes(normalizedType)) {
      throw new Error('INVALID_INCONSISTENCY_TYPE');
    }

    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.min(100, Math.max(10, Math.floor(pageSize)));
    const offset = (safePage - 1) * safePageSize;
    const freshnessHours = env.priceFreshnessHours;

    const issuePredicate = `(
      o.id_produto IS NULL
      OR o.data_atualizacao < NOW() - make_interval(hours => $2::int)
      OR (o.preco_fidelidade IS NOT NULL AND o.preco_fidelidade > o.preco_atual)
    )`;
    const typePredicate = `(
      $3 = ''
      OR ($3 = 'SEM_PRECO' AND o.id_produto IS NULL)
      OR ($3 = 'PRECO_DESATUALIZADO' AND o.id_produto IS NOT NULL
          AND o.data_atualizacao < NOW() - make_interval(hours => $2::int))
      OR ($3 = 'FIDELIDADE_MAIOR' AND o.preco_fidelidade IS NOT NULL
          AND o.preco_fidelidade > o.preco_atual)
    )`;

    const [summary, count, result] = await Promise.all([
      pool.query<{
        sem_preco: number;
        preco_desatualizado: number;
        fidelidade_maior: number;
        produtos_com_inconsistencia: number;
      }>(
        `SELECT
           COUNT(*) FILTER (WHERE o.id_produto IS NULL)::int AS sem_preco,
           COUNT(*) FILTER (
             WHERE o.id_produto IS NOT NULL
               AND o.data_atualizacao < NOW() - make_interval(hours => $2::int)
           )::int AS preco_desatualizado,
           COUNT(*) FILTER (
             WHERE o.preco_fidelidade IS NOT NULL AND o.preco_fidelidade > o.preco_atual
           )::int AS fidelidade_maior,
           COUNT(*) FILTER (WHERE ${issuePredicate})::int AS produtos_com_inconsistencia
         FROM supermercado_produto sp
         INNER JOIN produto p ON p.id_produto = sp.id_produto
         LEFT JOIN oferta_supermercado o
           ON o.id_produto = p.id_produto AND o.id_supermercado = sp.id_supermercado
         WHERE sp.id_supermercado = $1 AND sp.ativo = TRUE`,
        [marketId, freshnessHours],
      ),
      pool.query<{ total: number }>(
        `SELECT COUNT(*)::int AS total
         FROM supermercado_produto sp
         INNER JOIN produto p ON p.id_produto = sp.id_produto
         LEFT JOIN oferta_supermercado o
           ON o.id_produto = p.id_produto AND o.id_supermercado = sp.id_supermercado
         WHERE sp.id_supermercado = $1 AND sp.ativo = TRUE
           AND ${issuePredicate} AND ${typePredicate}`,
        [marketId, freshnessHours, normalizedType],
      ),
      pool.query(
        `SELECT
           p.id_produto,
           p.codigo_barras,
           p.nome_produto,
           p.marca,
           p.categoria,
           o.preco_atual,
           o.preco_fidelidade,
           o.data_atualizacao,
           ARRAY_REMOVE(ARRAY[
             CASE WHEN o.id_produto IS NULL THEN 'SEM_PRECO' END,
             CASE WHEN o.id_produto IS NOT NULL
                       AND o.data_atualizacao < NOW() - make_interval(hours => $2::int)
                  THEN 'PRECO_DESATUALIZADO' END,
             CASE WHEN o.preco_fidelidade IS NOT NULL AND o.preco_fidelidade > o.preco_atual
                  THEN 'FIDELIDADE_MAIOR' END
           ], NULL) AS problemas
         FROM supermercado_produto sp
         INNER JOIN produto p ON p.id_produto = sp.id_produto
         LEFT JOIN oferta_supermercado o
           ON o.id_produto = p.id_produto AND o.id_supermercado = sp.id_supermercado
         WHERE sp.id_supermercado = $1 AND sp.ativo = TRUE
           AND ${issuePredicate} AND ${typePredicate}
         ORDER BY
           (o.id_produto IS NULL) DESC,
           o.data_atualizacao ASC NULLS FIRST,
           p.nome_produto ASC,
           p.id_produto ASC
         LIMIT $4 OFFSET $5`,
        [marketId, freshnessHours, normalizedType, safePageSize, offset],
      ),
    ]);

    const counts = summary.rows[0] ?? { sem_preco: 0, preco_desatualizado: 0, fidelidade_maior: 0, produtos_com_inconsistencia: 0 };
    const total = count.rows[0]?.total ?? 0;
    return {
      resumo: {
        sem_preco: Number(counts.sem_preco ?? 0),
        preco_desatualizado: Number(counts.preco_desatualizado ?? 0),
        fidelidade_maior: Number(counts.fidelidade_maior ?? 0),
        produtos_com_inconsistencia: Number(counts.produtos_com_inconsistencia ?? 0),
        janela_frescor_horas: freshnessHours,
      },
      items: result.rows,
      pagination: {
        page: safePage,
        page_size: safePageSize,
        total,
        total_pages: Math.max(1, Math.ceil(total / safePageSize)),
      },
    };
  }

  async atualizarPreco(input: {
    accountId: number;
    marketId: number;
    productId: number;
    price: number;
    loyaltyPrice?: number | null;
  }): Promise<void> {
    if (!Number.isFinite(input.price) || input.price <= 0 || input.price > 1_000_000) throw new Error('INVALID_PRICE');
    if (input.loyaltyPrice != null && (!Number.isFinite(input.loyaltyPrice) || input.loyaltyPrice <= 0 || input.loyaltyPrice > 1_000_000)) {
      throw new Error('INVALID_PRICE');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const product = await client.query('SELECT 1 FROM produto WHERE id_produto = $1', [input.productId]);
      if (!product.rowCount) throw new Error('PRODUCT_NOT_FOUND');

      await client.query(
        `INSERT INTO supermercado_produto (id_supermercado, id_produto, ativo, origem, atualizado_em)
         VALUES ($1, $2, TRUE, 'MANUAL', NOW())
         ON CONFLICT (id_supermercado, id_produto)
         DO UPDATE SET ativo = TRUE, origem = 'MANUAL', atualizado_em = NOW()`,
        [input.marketId, input.productId],
      );

      await client.query(
        `INSERT INTO oferta_supermercado
           (id_supermercado, id_produto, preco_atual, preco_fidelidade, fonte, data_atualizacao)
         VALUES ($1, $2, $3, $4, 'MANUAL', NOW())
         ON CONFLICT (id_supermercado, id_produto)
         DO UPDATE SET
           preco_atual = EXCLUDED.preco_atual,
           preco_fidelidade = EXCLUDED.preco_fidelidade,
           fonte = 'MANUAL',
           data_atualizacao = NOW()`,
        [input.marketId, input.productId, input.price, input.loyaltyPrice ?? null],
      );

      await client.query(
        `INSERT INTO auditoria (id_conta, acao, entidade, entidade_id, dados)
         VALUES ($1, 'PRECO_ATUALIZADO', 'oferta_supermercado', $2, $3::jsonb)`,
        [input.accountId, `${input.marketId}:${input.productId}`, JSON.stringify({ preco: input.price, preco_fidelidade: input.loyaltyPrice ?? null })],
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
