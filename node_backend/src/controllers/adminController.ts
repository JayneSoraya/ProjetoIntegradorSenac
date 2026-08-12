import { Request, Response } from 'express';
import { pool } from '../database';

// ── GET /api/admin/mercados ────────────────────────────────
export const listarMercados = async (req: Request, res: Response) => {
  try {
    const resultado = await pool.query(`
      SELECT
        s.id_supermercado,
        s.nome_fantasia,
        s.cnpj,
        s.endereco_completo,
        s.esta_aberto,
        COUNT(o.id_produto) AS total_produtos,
        MAX(o.data_atualizacao) AS ultima_atualizacao
      FROM supermercado s
      LEFT JOIN oferta_supermercado o ON o.id_supermercado = s.id_supermercado
      GROUP BY s.id_supermercado, s.nome_fantasia, s.cnpj,
               s.endereco_completo, s.esta_aberto
      ORDER BY s.nome_fantasia
    `);
    return res.status(200).json(resultado.rows);
  } catch (erro) {
    console.error('❌ Erro ao listar mercados:', erro);
    return res.status(500).json({ erro: 'Erro ao buscar mercados.' });
  }
};

// ── POST /api/admin/mercados ───────────────────────────────
export const cadastrarMercado = async (req: Request, res: Response) => {
  const { cnpj, nome_fantasia, endereco_completo } = req.body;

  if (!cnpj || !nome_fantasia || !endereco_completo) {
    return res.status(400).json({ erro: 'CNPJ, nome e endereço são obrigatórios.' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO supermercado (cnpj, nome_fantasia, endereco_completo)
       VALUES ($1, $2, $3) RETURNING *`,
      [cnpj, nome_fantasia, endereco_completo]
    );
    return res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error('❌ Erro ao cadastrar mercado:', erro);
    return res.status(500).json({ erro: 'Erro ao cadastrar mercado.' });
  }
};

// ── PUT /api/admin/mercados/:id ────────────────────────────
export const editarMercado = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome_fantasia, endereco_completo, esta_aberto } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE supermercado
       SET nome_fantasia = $1, endereco_completo = $2, esta_aberto = $3
       WHERE id_supermercado = $4 RETURNING *`,
      [nome_fantasia, endereco_completo, esta_aberto, id]
    );
    if (resultado.rows.length === 0)
      return res.status(404).json({ erro: 'Mercado não encontrado.' });
    return res.status(200).json(resultado.rows[0]);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro ao editar mercado.' });
  }
};

// ── DELETE /api/admin/mercados/:id ─────────────────────────
export const removerMercado = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query(
      'DELETE FROM supermercado WHERE id_supermercado = $1', [id]
    );
    return res.status(200).json({ mensagem: 'Mercado removido.' });
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro ao remover mercado.' });
  }
};

// ── GET /api/admin/usuarios ────────────────────────────────
export const listarUsuarios = async (req: Request, res: Response) => {
  const { busca } = req.query;
  try {
    let sql = `
      SELECT
        c.id_conta,
        c.nome,
        c.email,
        c.status_conta,
        c.data_cadastro,
        c.ultimo_login,
        u.id_usuario,
        u.saldo_receita,
        u.aceite_lgpd,
        COUNT(DISTINCT ca.id_carrinho) AS total_comparacoes,
        -- EconoCoins: 50 base + 100 por comparação
        (50 + COUNT(DISTINCT ca.id_carrinho) * 100) AS econo_coins
      FROM conta c
      INNER JOIN usuario u ON u.id_conta = c.id_conta
      LEFT JOIN carrinho ca ON ca.id_usuario = u.id_usuario
      WHERE c.tipo_conta = 'USER'
    `;

    const params: string[] = [];

    if (busca) {
      sql += ` AND (LOWER(c.nome) LIKE LOWER($1) OR LOWER(c.email) LIKE LOWER($1))`;
      params.push(`%${busca}%`);
    }

    sql += ` GROUP BY c.id_conta, c.nome, c.email, c.status_conta,
             c.data_cadastro, c.ultimo_login, u.id_usuario,
             u.saldo_receita, u.aceita_lgpd
             ORDER BY c.nome`;

    const resultado = await pool.query(sql, params);
    return res.status(200).json(resultado.rows);
  } catch (erro) {
    console.error('❌ Erro ao listar usuários:', erro);
    return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
  }
};

export const bloquearUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { bloquear } = req.body; 
  try {
    await pool.query(
      'UPDATE conta SET status_conta = $1 WHERE id_conta = $2',
      [!bloquear, id]
    );
    return res.status(200).json({
      mensagem: bloquear ? 'Usuário bloqueado.' : 'Usuário desbloqueado.',
    });
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro ao bloquear usuário.' });
  }
};

export const listarProdutosAdmin = async (req: Request, res: Response) => {
  const { busca, categoria } = req.query;
  try {
    let sql = `
      SELECT
        p.id_produto,
        p.codigo_barras,
        p.nome_produto,
        p.marca,
        p.categoria,
        p.peso,
        p.unidade_medida,
        COUNT(o.id_supermercado) AS total_mercados,
        MIN(o.preco_atual) AS menor_preco,
        MAX(o.preco_atual) AS maior_preco
      FROM produto p
      LEFT JOIN oferta_supermercado o ON o.id_produto = p.id_produto
      WHERE 1=1
    `;
    const params: string[] = [];
    let i = 1;

    if (busca) {
      sql += ` AND (LOWER(p.nome_produto) LIKE LOWER($${i}) OR LOWER(p.marca) LIKE LOWER($${i}))`;
      params.push(`%${busca}%`); i++;
    }
    if (categoria && categoria !== 'Todos') {
      sql += ` AND p.categoria = $${i}`;
      params.push(categoria as string);
    }

    sql += ` GROUP BY p.id_produto ORDER BY p.nome_produto LIMIT 100`;

    const resultado = await pool.query(sql, params);
    return res.status(200).json(resultado.rows);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
};

export const corrigirCategoria = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { categoria } = req.body;
  try {
    await pool.query(
      'UPDATE produto SET categoria = $1 WHERE id_produto = $2',
      [categoria, id]
    );
    return res.status(200).json({ mensagem: 'Categoria atualizada.' });
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro ao atualizar categoria.' });
  }
};