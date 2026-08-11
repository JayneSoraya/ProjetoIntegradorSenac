import { pool } from '../database';
import { validatePriceImport } from '../domain/priceImport';

interface ExistingImport {
  id_importacao: number;
  status: string;
}

export class PriceImportService {
  static validate(records: unknown) {
    return validatePriceImport(records);
  }

  static async apply(input: {
    accountId: number;
    marketId: number;
    format: 'CSV' | 'JSON';
    fileName: string;
    records: unknown;
  }) {
    const validation = validatePriceImport(input.records);
    if (validation.erros.length) throw Object.assign(new Error('IMPORT_HAS_ERRORS'), { validation });

    // O histórico da tentativa vive fora da transação de publicação. Assim uma falha
    // não deixa preços parcialmente aplicados, mas continua auditável no portal.
    let importId: number;
    const inserted = await pool.query<{ id_importacao: number }>(
      `INSERT INTO importacao_preco (
         id_supermercado, id_conta_responsavel, formato, nome_arquivo,
         checksum_sha256, status, total_registros, registros_validos, registros_invalidos
       ) VALUES ($1, $2, $3, $4, $5, 'PROCESSANDO', $6, $6, 0)
       ON CONFLICT (id_supermercado, checksum_sha256) DO NOTHING
       RETURNING id_importacao`,
      [
        input.marketId,
        input.accountId,
        input.format,
        input.fileName.slice(0, 255),
        validation.checksum,
        validation.total,
      ],
    );

    if (inserted.rows[0]) {
      importId = inserted.rows[0].id_importacao;
    } else {
      const existing = await pool.query<ExistingImport>(
        `SELECT id_importacao, status
         FROM importacao_preco
         WHERE id_supermercado = $1 AND checksum_sha256 = $2
         LIMIT 1`,
        [input.marketId, validation.checksum],
      );
      const current = existing.rows[0];
      if (!current || current.status !== 'FALHOU') throw new Error('DUPLICATE_IMPORT');

      const retry = await pool.query<{ id_importacao: number }>(
        `UPDATE importacao_preco
         SET id_conta_responsavel = $1,
             formato = $2,
             nome_arquivo = $3,
             status = 'PROCESSANDO',
             total_registros = $4,
             registros_validos = $4,
             registros_invalidos = 0,
             criada_em = NOW(),
             concluida_em = NULL
         WHERE id_importacao = $5 AND status = 'FALHOU'
         RETURNING id_importacao`,
        [input.accountId, input.format, input.fileName.slice(0, 255), validation.total, current.id_importacao],
      );
      if (!retry.rows[0]) throw new Error('DUPLICATE_IMPORT');
      importId = retry.rows[0].id_importacao;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Um lote de até 5.000 linhas não deve produzir milhares de round-trips SQL.
      // PostgreSQL recebe o lote validado como JSONB e faz os upserts de modo set-based.
      const batch = validation.validos.map((record) => ({
        codigo: record.ean || record.codigoProduto,
        nome: record.nomeProduto,
        marca: record.marca || null,
        categoria: record.categoria,
        unidade: record.unidade || null,
        preco: record.preco,
        preco_fidelidade: record.precoFidelidade,
      }));

      await client.query(
        `WITH input AS (
           SELECT *
           FROM jsonb_to_recordset($1::jsonb) AS x(
             codigo TEXT,
             nome TEXT,
             marca TEXT,
             categoria TEXT,
             unidade TEXT,
             preco NUMERIC,
             preco_fidelidade NUMERIC
           )
         ),
         upserted_products AS (
           INSERT INTO produto (
             codigo_barras, nome_produto, marca, categoria, unidade_medida, atualizado_em
           )
           SELECT codigo, nome, marca, categoria, unidade, NOW()
           FROM input
           ON CONFLICT (codigo_barras)
           DO UPDATE SET
             nome_produto = EXCLUDED.nome_produto,
             marca = EXCLUDED.marca,
             categoria = EXCLUDED.categoria,
             unidade_medida = EXCLUDED.unidade_medida,
             atualizado_em = NOW()
           RETURNING id_produto, codigo_barras
         ),
         catalog_membership AS (
           INSERT INTO supermercado_produto (
             id_supermercado, id_produto, ativo, origem, atualizado_em
           )
           SELECT $2, p.id_produto, TRUE, 'IMPORTACAO', NOW()
           FROM upserted_products p
           ON CONFLICT (id_supermercado, id_produto)
           DO UPDATE SET ativo = TRUE, origem = 'IMPORTACAO', atualizado_em = NOW()
           RETURNING id_produto
         )
         INSERT INTO oferta_supermercado (
           id_supermercado, id_produto, preco_atual, preco_fidelidade, fonte, data_atualizacao
         )
         SELECT $2, p.id_produto, i.preco, i.preco_fidelidade, 'IMPORTACAO', NOW()
         FROM input i
         INNER JOIN upserted_products p ON p.codigo_barras = i.codigo
         ON CONFLICT (id_supermercado, id_produto)
         DO UPDATE SET
           preco_atual = EXCLUDED.preco_atual,
           preco_fidelidade = EXCLUDED.preco_fidelidade,
           fonte = 'IMPORTACAO',
           data_atualizacao = NOW()`,
        [JSON.stringify(batch), input.marketId],
      );

      await client.query(
        `UPDATE importacao_preco
         SET status = 'CONCLUIDA', concluida_em = NOW()
         WHERE id_importacao = $1`,
        [importId],
      );
      await client.query(
        `INSERT INTO auditoria (id_conta, acao, entidade, entidade_id, dados)
         VALUES ($1, 'IMPORTACAO_PRECOS_CONCLUIDA', 'importacao_preco', $2, $3::jsonb)`,
        [
          input.accountId,
          String(importId),
          JSON.stringify({ mercadoId: input.marketId, total: validation.total, checksum: validation.checksum }),
        ],
      );
      await client.query('COMMIT');

      return {
        id_importacao: importId,
        checksum: validation.checksum,
        total_registros: validation.total,
        status: 'CONCLUIDA',
      };
    } catch (error) {
      await client.query('ROLLBACK');
      await pool.query(
        `UPDATE importacao_preco
         SET status = 'FALHOU', concluida_em = NOW()
         WHERE id_importacao = $1`,
        [importId],
      ).catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  static async history(marketId: number, limit = 50) {
    const result = await pool.query(
      `SELECT
         id_importacao, formato, nome_arquivo, checksum_sha256, status,
         total_registros, registros_validos, registros_invalidos, criada_em, concluida_em
       FROM importacao_preco
       WHERE id_supermercado = $1
       ORDER BY criada_em DESC
       LIMIT $2`,
      [marketId, Math.min(Math.max(limit, 1), 100)],
    );
    return result.rows;
  }
}
