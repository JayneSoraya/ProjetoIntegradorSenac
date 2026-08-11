import { createHash } from 'node:crypto';
import { pool } from '../database';
import { isValidCnpj } from '../domain/brDocuments';
import { fetchNfceHtml } from './nfceFetchService';
import { extractNfceAccessKey, parseNfceHtml } from './nfceParser';

const NFCE_REWARD_POINTS = 100;
const ECONOCOIN_POLICY_VERSION = '2026-08-alpha1';

export interface ProcessedReceipt {
  mensagem: string;
  id_nota: number;
  chave_acesso: string | null;
  supermercado: string;
  produtos_salvos: number;
  produtos: string[];
  econo_coins_creditados: number;
}

export class ReceiptService {
  static async process(userId: number, rawUrl: string): Promise<ProcessedReceipt> {
    const fetched = await fetchNfceHtml(rawUrl);
    const nota = parseNfceHtml(fetched.html);
    const chaveAcesso = extractNfceAccessKey(fetched.finalUrl, fetched.html);
    const documentHash = createHash('sha256')
      .update(chaveAcesso ? `chave:${chaveAcesso}` : fetched.html)
      .digest('hex');

    if (!isValidCnpj(nota.cnpj)) throw new Error('NFCE_CNPJ_INVALID');
    if (!nota.itens.length) throw new Error('NFCE_NO_ITEMS');

    const client = await pool.connect();
    const produtosSalvos: string[] = [];

    try {
      await client.query('BEGIN');

      const duplicate = await client.query<{ id_nota: number }>(
        `SELECT id_nota FROM nota_fiscal
         WHERE hash_documento = $1 OR ($2::varchar IS NOT NULL AND chave_acesso = $2)
         LIMIT 1`,
        [documentHash, chaveAcesso],
      );
      if (duplicate.rows[0]) throw new Error('NFCE_DUPLICATE');

      const supermercadoExistente = await client.query<{ id_supermercado: number }>(
        'SELECT id_supermercado FROM supermercado WHERE cnpj = $1',
        [nota.cnpj],
      );

      let idSupermercado: number;
      if (supermercadoExistente.rows[0]) {
        idSupermercado = supermercadoExistente.rows[0].id_supermercado;
      } else {
        const novoSupermercado = await client.query<{ id_supermercado: number }>(
          `INSERT INTO supermercado (cnpj, nome_fantasia, endereco_completo, status_cadastro)
           VALUES ($1, $2, $3, 'PENDENTE')
           RETURNING id_supermercado`,
          [nota.cnpj, nota.nomeEmitente || 'Supermercado', nota.endereco || 'Não informado'],
        );
        idSupermercado = novoSupermercado.rows[0].id_supermercado;
      }

      const insertedNote = await client.query<{ id_nota: number }>(
        `INSERT INTO nota_fiscal (
           id_usuario, id_supermercado, chave_acesso, url_qrcode, hash_documento, status
         ) VALUES ($1, $2, $3, $4, $5, 'VALIDA')
         RETURNING id_nota`,
        [userId, idSupermercado, chaveAcesso, fetched.finalUrl.toString(), documentHash],
      );
      const noteId = insertedNote.rows[0].id_nota;

      // NFC-e contém dezenas de itens, não milhares. O loop é deliberado neste Alpha porque
      // cada item precisa resolver o ID canônico antes de gravar oferta e snapshot da nota.
      // Se a telemetria mostrar gargalo, migrar para upsert set-based com jsonb_to_recordset.
      for (const item of nota.itens) {
        const product = await client.query<{ id_produto: number }>(
          `INSERT INTO produto (codigo_barras, nome_produto, categoria)
           VALUES ($1, $2, 'Outros')
           ON CONFLICT (codigo_barras)
           DO UPDATE SET nome_produto = EXCLUDED.nome_produto, atualizado_em = NOW()
           RETURNING id_produto`,
          [item.codigo, item.nome],
        );
        const productId = product.rows[0].id_produto;

        await client.query(
          `INSERT INTO supermercado_produto (id_supermercado, id_produto, ativo, origem, atualizado_em)
           VALUES ($1, $2, TRUE, 'NFCE', NOW())
           ON CONFLICT (id_supermercado, id_produto)
           DO UPDATE SET ativo = TRUE, origem = 'NFCE', atualizado_em = NOW()`,
          [idSupermercado, productId],
        );

        await client.query(
          `INSERT INTO oferta_supermercado
             (id_supermercado, id_produto, preco_atual, fonte, data_atualizacao)
           VALUES ($1, $2, $3, 'NFCE', NOW())
           ON CONFLICT (id_supermercado, id_produto)
           DO UPDATE SET preco_atual = EXCLUDED.preco_atual, fonte = 'NFCE', data_atualizacao = NOW()`,
          [idSupermercado, productId, item.preco],
        );

        await client.query(
          `INSERT INTO nota_item (
             id_nota, id_produto, codigo_barras, nome_produto, quantidade, preco_unitario
           ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [noteId, productId, item.codigo, item.nome, item.quantidade, item.preco],
        );
        produtosSalvos.push(item.nome);
      }

      await client.query(
        `INSERT INTO econocoin_evento (
           id_usuario, tipo, pontos, referencia_tipo, referencia_id, politica_versao
         ) VALUES ($1, 'NFCE_VALIDADA', $2, 'nota_fiscal', $3, $4)`,
        [userId, NFCE_REWARD_POINTS, noteId, ECONOCOIN_POLICY_VERSION],
      );

      await client.query('COMMIT');
      return {
        mensagem: 'Nota processada com sucesso.',
        id_nota: noteId,
        chave_acesso: chaveAcesso,
        supermercado: nota.nomeEmitente,
        produtos_salvos: produtosSalvos.length,
        produtos: produtosSalvos,
        econo_coins_creditados: NFCE_REWARD_POINTS,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
