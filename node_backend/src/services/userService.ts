import bcrypt from 'bcrypt';
import { pool } from '../database';

function optionalCoordinate(value: unknown, min: number, max: number): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) throw new Error('INVALID_COORDINATES');
  return parsed;
}

export class UserService {
  static async profile(accountId: number, userId: number) {
    const result = await pool.query(
      `SELECT
         c.id_conta, u.id_usuario, c.nome, c.email, c.cep,
         u.aceite_lgpd, u.tipo_veiculo, u.latitude, u.longitude, u.endereco,
         c.dt_cadastro, c.ultimo_login
       FROM conta c
       INNER JOIN usuario u ON u.id_conta = c.id_conta
       WHERE c.id_conta = $1 AND u.id_usuario = $2 AND c.status_conta = TRUE
       LIMIT 1`,
      [accountId, userId],
    );
    return result.rows[0] ?? null;
  }

  static async updateProfile(input: {
    accountId: number;
    userId: number;
    cep?: unknown;
    endereco?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    tipoVeiculo?: unknown;
  }) {
    const cep = input.cep === undefined ? undefined : String(input.cep ?? '').replace(/\D/g, '');
    if (cep !== undefined && cep !== '' && cep.length !== 8) throw new Error('INVALID_CEP');
    const endereco = input.endereco === undefined ? undefined : String(input.endereco ?? '').trim().slice(0, 255) || null;
    const tipoVeiculo = input.tipoVeiculo === undefined ? undefined : String(input.tipoVeiculo ?? '').trim().slice(0, 50) || null;
    const latitude = optionalCoordinate(input.latitude, -90, 90);
    const longitude = optionalCoordinate(input.longitude, -180, 180);
    if ((latitude === null) !== (longitude === null) && (latitude !== undefined || longitude !== undefined)) {
      throw new Error('INVALID_COORDINATES');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (cep !== undefined) {
        await client.query('UPDATE conta SET cep = $1 WHERE id_conta = $2', [cep || null, input.accountId]);
      }
      const changed = await client.query(
        `UPDATE usuario
         SET endereco = CASE WHEN $1::boolean THEN $2::varchar ELSE endereco END,
             latitude = CASE WHEN $3::boolean THEN $4::numeric ELSE latitude END,
             longitude = CASE WHEN $5::boolean THEN $6::numeric ELSE longitude END,
             tipo_veiculo = CASE WHEN $7::boolean THEN $8::varchar ELSE tipo_veiculo END
         WHERE id_usuario = $9 AND id_conta = $10
         RETURNING id_usuario`,
        [
          endereco !== undefined, endereco ?? null,
          latitude !== undefined, latitude ?? null,
          longitude !== undefined, longitude ?? null,
          tipoVeiculo !== undefined, tipoVeiculo ?? null,
          input.userId, input.accountId,
        ],
      );
      if (!changed.rowCount) throw new Error('USER_NOT_FOUND');
      await client.query('COMMIT');
      return await this.profile(input.accountId, input.userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async exportPersonalData(accountId: number, userId: number) {
    const [profile, favorites, carts, comparisons, notes, coinEvents] = await Promise.all([
      this.profile(accountId, userId),
      pool.query(
        `SELECT f.id_supermercado, s.nome_fantasia, f.criado_em
         FROM favorito_supermercado f
         INNER JOIN supermercado s ON s.id_supermercado = f.id_supermercado
         WHERE f.id_usuario = $1 ORDER BY f.criado_em`,
        [userId],
      ),
      pool.query(
        `SELECT c.id_carrinho, c.status, c.data_criacao, c.atualizado_em,
                COALESCE(jsonb_agg(jsonb_build_object(
                  'id_produto', ic.id_produto,
                  'quantidade', ic.quantidade,
                  'preco_unitario', ic.preco_unitario
                )) FILTER (WHERE ic.id_item_carrinho IS NOT NULL), '[]'::jsonb) AS itens
         FROM carrinho c
         LEFT JOIN item_carrinho ic ON ic.id_carrinho = c.id_carrinho
         WHERE c.id_usuario = $1
         GROUP BY c.id_carrinho
         ORDER BY c.data_criacao DESC`,
        [userId],
      ),
      pool.query(
        `SELECT cp.*
         FROM comparacao cp
         INNER JOIN carrinho c ON c.id_carrinho = cp.id_carrinho
         WHERE c.id_usuario = $1
         ORDER BY cp.data_comparacao DESC`,
        [userId],
      ),
      pool.query(
        `SELECT n.id_nota, n.id_supermercado, n.chave_acesso, n.data_emissao,
                n.processada_em, n.status,
                COALESCE(jsonb_agg(jsonb_build_object(
                  'codigo_barras', ni.codigo_barras,
                  'nome_produto', ni.nome_produto,
                  'quantidade', ni.quantidade,
                  'preco_unitario', ni.preco_unitario
                )) FILTER (WHERE ni.id_nota_item IS NOT NULL), '[]'::jsonb) AS itens
         FROM nota_fiscal n
         LEFT JOIN nota_item ni ON ni.id_nota = n.id_nota
         WHERE n.id_usuario = $1
         GROUP BY n.id_nota
         ORDER BY n.processada_em DESC`,
        [userId],
      ),
      pool.query(
        `SELECT id_evento, tipo, pontos, referencia_tipo, referencia_id, politica_versao, criado_em
         FROM econocoin_evento WHERE id_usuario = $1 ORDER BY criado_em`,
        [userId],
      ),
    ]);

    if (!profile) throw new Error('USER_NOT_FOUND');
    return {
      exportado_em: new Date().toISOString(),
      perfil: profile,
      favoritos: favorites.rows,
      carrinhos: carts.rows,
      comparacoes: comparisons.rows,
      notas_fiscais: notes.rows,
      econocoins: coinEvents.rows,
    };
  }

  static async deleteAccount(accountId: number, userId: number, password: string): Promise<void> {
    if (!password) throw new Error('PASSWORD_REQUIRED');
    const result = await pool.query<{ senha: string }>(
      `SELECT c.senha
       FROM conta c INNER JOIN usuario u ON u.id_conta = c.id_conta
       WHERE c.id_conta = $1 AND u.id_usuario = $2 AND c.tipo_conta = 'USUARIO'
       LIMIT 1`,
      [accountId, userId],
    );
    const current = result.rows[0];
    if (!current || !(await bcrypt.compare(password, current.senha))) throw new Error('INVALID_CREDENTIALS');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO auditoria (id_conta, acao, entidade, entidade_id, dados)
         VALUES ($1, 'CONTA_EXCLUIDA_PELO_USUARIO', 'conta', $2, '{}'::jsonb)`,
        [accountId, String(accountId)],
      );
      await client.query('DELETE FROM conta WHERE id_conta = $1', [accountId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
