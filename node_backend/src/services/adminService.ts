import { pool } from '../database';

export class AdminService {
  static async resumo() {
    const result = await pool.query<{
      usuarios_ativos: number;
      supermercados: number;
      produtos: number;
      importacoes_com_erro: number;
    }>(`
      SELECT
        (SELECT COUNT(*)::int FROM conta WHERE tipo_conta = 'USUARIO' AND status_conta = TRUE) AS usuarios_ativos,
        (SELECT COUNT(*)::int FROM supermercado) AS supermercados,
        (SELECT COUNT(*)::int FROM produto) AS produtos,
        (SELECT COUNT(*)::int FROM importacao_preco WHERE status = 'FALHOU') AS importacoes_com_erro
    `);
    return result.rows[0];
  }

  static async listarUsuarios(busca = '', limit = 50) {
    const safeSearch = busca.trim().slice(0, 120);
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100);
    const result = await pool.query(
      `SELECT id_conta, nome, email, tipo_conta, status_conta, dt_cadastro, ultimo_login
       FROM conta
       WHERE $1 = '' OR nome ILIKE $2 OR email ILIKE $2
       ORDER BY dt_cadastro DESC
       LIMIT $3`,
      [safeSearch, `%${safeSearch}%`, safeLimit],
    );
    return result.rows;
  }

  static async alterarStatusConta(actorAccountId: number, accountId: number, active: boolean) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const changed = await client.query(
        `UPDATE conta SET status_conta = $1
         WHERE id_conta = $2
         RETURNING id_conta, nome, email, tipo_conta, status_conta`,
        [active, accountId],
      );
      if (!changed.rows[0]) throw new Error('ACCOUNT_NOT_FOUND');

      await client.query(
        `INSERT INTO auditoria (id_conta, acao, entidade, entidade_id, dados)
         VALUES ($1, $2, 'conta', $3, $4::jsonb)`,
        [actorAccountId, active ? 'CONTA_ATIVADA' : 'CONTA_BLOQUEADA', String(accountId), JSON.stringify({ status_conta: active })],
      );
      await client.query('COMMIT');
      return changed.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async listarSupermercados(status = '') {
    const normalized = status.trim().toUpperCase();
    const result = await pool.query(
      `SELECT
         s.id_supermercado, s.cnpj, s.nome_fantasia, s.endereco_completo,
         s.status_cadastro, s.esta_aberto, s.reputacao_media, s.criado_em,
         (SELECT COUNT(*)::int FROM supermercado_responsavel sr
            WHERE sr.id_supermercado = s.id_supermercado AND sr.status = 'ATIVO') AS responsaveis_ativos,
         (SELECT COUNT(*)::int FROM oferta_supermercado o
            WHERE o.id_supermercado = s.id_supermercado) AS produtos_com_preco
       FROM supermercado s
       WHERE $1 = '' OR s.status_cadastro = $1
       ORDER BY s.criado_em DESC
       LIMIT 200`,
      [normalized],
    );
    return result.rows;
  }

  static async alterarStatusSupermercado(actorAccountId: number, marketId: number, status: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const changed = await client.query(
        `UPDATE supermercado SET status_cadastro = $1, atualizado_em = NOW()
         WHERE id_supermercado = $2
         RETURNING id_supermercado, nome_fantasia, status_cadastro`,
        [status, marketId],
      );
      if (!changed.rows[0]) throw new Error('MARKET_NOT_FOUND');

      await client.query(
        `INSERT INTO auditoria (id_conta, acao, entidade, entidade_id, dados)
         VALUES ($1, 'STATUS_SUPERMERCADO_ALTERADO', 'supermercado', $2, $3::jsonb)`,
        [actorAccountId, String(marketId), JSON.stringify({ status })],
      );
      await client.query('COMMIT');
      return changed.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async listarAuditoria(limit = 50) {
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 200);
    const result = await pool.query(
      `SELECT a.id_auditoria, a.id_conta, c.nome AS ator_nome, a.acao, a.entidade,
              a.entidade_id, a.dados, a.criado_em
       FROM auditoria a
       LEFT JOIN conta c ON c.id_conta = a.id_conta
       ORDER BY a.criado_em DESC
       LIMIT $1`,
      [safeLimit],
    );
    return result.rows;
  }
}
