import { PoolClient } from 'pg';
import { pool } from '../database';
import { CartItemInput } from '../domain/cart';

interface CartRow {
  id_carrinho: number;
  status: string;
  data_criacao: Date;
  atualizado_em: Date;
}

export class CartService {
  static async getOpenCart(userId: number) {
    const cartResult = await pool.query<CartRow>(
      `SELECT id_carrinho, status, data_criacao, atualizado_em
       FROM carrinho
       WHERE id_usuario = $1 AND status = 'ABERTO'
       ORDER BY atualizado_em DESC
       LIMIT 1`,
      [userId],
    );

    const cart = cartResult.rows[0];
    if (!cart) {
      return { id_carrinho: null, status: 'ABERTO', itens: [], total_itens: 0 };
    }

    const items = await pool.query(
      `SELECT
         ic.id_produto,
         p.nome_produto,
         ic.quantidade,
         COALESCE(
           ic.preco_unitario,
           (SELECT MIN(o.preco_atual)
            FROM oferta_supermercado o
            INNER JOIN supermercado s ON s.id_supermercado = o.id_supermercado
            WHERE o.id_produto = ic.id_produto AND s.status_cadastro = 'APROVADO')
         ) AS preco_unitario
       FROM item_carrinho ic
       INNER JOIN produto p ON p.id_produto = ic.id_produto
       WHERE ic.id_carrinho = $1
       ORDER BY p.nome_produto`,
      [cart.id_carrinho],
    );

    return {
      ...cart,
      itens: items.rows,
      total_itens: items.rows.reduce((sum, item) => sum + Number(item.quantidade), 0),
    };
  }

  static async replaceOpenCart(userId: number, items: CartItemInput[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const cartId = await this.ensureOpenCart(client, userId);

      await client.query('DELETE FROM item_carrinho WHERE id_carrinho = $1', [cartId]);
      if (items.length) {
        const inserted = await client.query(
          `WITH input AS (
             SELECT * FROM jsonb_to_recordset($2::jsonb) AS x(id_produto BIGINT, quantidade INTEGER)
           )
           INSERT INTO item_carrinho (id_carrinho, id_produto, quantidade)
           SELECT $1, i.id_produto, i.quantidade
           FROM input i
           INNER JOIN produto p ON p.id_produto = i.id_produto`,
          [cartId, JSON.stringify(items.map((item) => ({ id_produto: item.idProduto, quantidade: item.quantidade })))],
        );
        if ((inserted.rowCount ?? 0) !== items.length) throw new Error('PRODUCT_NOT_FOUND');
      }

      await client.query(
        'UPDATE carrinho SET atualizado_em = NOW() WHERE id_carrinho = $1',
        [cartId],
      );
      await client.query('COMMIT');
      return cartId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async clearOpenCart(userId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const cart = await client.query<{ id_carrinho: number }>(
        `SELECT id_carrinho FROM carrinho
         WHERE id_usuario = $1 AND status = 'ABERTO'
         ORDER BY atualizado_em DESC LIMIT 1
         FOR UPDATE`,
        [userId],
      );
      if (cart.rows[0]) {
        await client.query('DELETE FROM item_carrinho WHERE id_carrinho = $1', [cart.rows[0].id_carrinho]);
        await client.query('UPDATE carrinho SET atualizado_em = NOW() WHERE id_carrinho = $1', [cart.rows[0].id_carrinho]);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async ensureOpenCart(client: PoolClient, userId: number): Promise<number> {
    const existing = await client.query<{ id_carrinho: number }>(
      `SELECT id_carrinho FROM carrinho
       WHERE id_usuario = $1 AND status = 'ABERTO'
       ORDER BY atualizado_em DESC LIMIT 1
       FOR UPDATE`,
      [userId],
    );
    if (existing.rows[0]) return existing.rows[0].id_carrinho;

    const created = await client.query<{ id_carrinho: number }>(
      `INSERT INTO carrinho (id_usuario, status, atualizado_em)
       VALUES ($1, 'ABERTO', NOW())
       ON CONFLICT (id_usuario) WHERE status = 'ABERTO'
       DO UPDATE SET atualizado_em = EXCLUDED.atualizado_em
       RETURNING id_carrinho`,
      [userId],
    );
    return created.rows[0].id_carrinho;
  }
}
