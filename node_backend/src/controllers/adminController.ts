import { Request, Response } from 'express';
import { pool } from '../database';
import { logger } from '../utils/logger';
import { obterPlaceholderPorCategoria } from '../utils/imagemUtils';

// -- GET /api/admin/mercados --------------------------------
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
    logger.error(`? Erro ao listar mercados: ${
      erro instanceof Error ? erro.message : String(erro)}`);
    return res.status(500).json({ erro: 'Erro ao buscar mercados.' });
  }
};

// -- POST /api/admin/mercados -------------------------------
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
    logger.error(
      `? Erro ao cadastrar mercado: ${
        erro instanceof Error ? erro.message : String(erro)
      }`
    );
    return res.status(500).json({ erro: 'Erro ao cadastrar mercado.' });
  }
};

// -- PUT /api/admin/mercados/:id ----------------------------
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

// -- DELETE /api/admin/mercados/:id -------------------------
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

// -- GET /api/admin/usuarios --------------------------------
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
        u.aceita_lgpd,
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
console.log(sql);
    const resultado = await pool.query(sql, params);
    console.log(
  'PRODUTOS ENCONTRADOS:',
  resultado.rows.length
);
    return res.status(200).json(resultado.rows);
  } catch (erro) {
    logger.error(
      `? Erro ao listar usuários: ${
        erro instanceof Error ? erro.message : String(erro)
      }`
    );
    return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
  }
};

// -- PATCH /api/admin/usuarios/:id/bloquear -----------------
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

// -- GET /api/admin/produtos --------------------------------
export const listarProdutosAdmin = async (req: Request, res: Response) => {
  const { busca, categoria, status_enriquecimento, status_imagem, pagina = 1, limite = 20 } = req.query;

  try {
    const offset = (Number(pagina) - 1) * Number(limite);

    // 1. Contadores de backlog para os chips da interface
    const contadoresQuery = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status_enriquecimento = 'PENDENTE') AS pendente,
        COUNT(*) FILTER (WHERE status_enriquecimento = 'ENRIQUECIDO') AS enriquecido,
        COUNT(*) FILTER (WHERE status_enriquecimento = 'CONCLUIDO') AS concluido,
        COUNT(*) FILTER (WHERE imagem_url IS NULL OR imagem_status = 'PENDENTE') AS sem_imagem,
        COUNT(*) FILTER (WHERE imagem_url IS NOT NULL AND imagem_status = 'CONCLUIDO') AS com_imagem,
        COUNT(*) AS total_geral
      FROM produto
    `);

    // 2. Query principal com dados de oferta e rastreabilidade da NFC-e
    let sql = `
      SELECT
        p.id_produto,
        p.codigo_barras,
        p.nome_original,
        p.nome_produto,
        p.marca,
        p.categoria,
        p.peso,
        p.unidade_medida,
        p.status_enriquecimento,
        p.imagem_url,
        p.imagem_status,
        COUNT(DISTINCT o.id_supermercado) AS total_mercados,
        MIN(o.preco_atual) AS menor_preco,
        MAX(o.preco_atual) AS maior_preco,
        (SELECT COUNT(DISTINCT ni.id_nota) FROM nota_item ni WHERE ni.id_produto = p.id_produto) AS total_notas,
        (SELECT MIN(n.data_compra) FROM nota_item ni JOIN nota_fiscal n ON ni.id_nota = n.id_nota WHERE ni.id_produto = p.id_produto) AS primeira_ocorrencia_data,
        (SELECT MIN(n.id_nota) FROM nota_item ni JOIN nota_fiscal n ON ni.id_nota = n.id_nota WHERE ni.id_produto = p.id_produto) AS primeira_ocorrencia_id_nota,
        (SELECT MAX(n.data_compra) FROM nota_item ni JOIN nota_fiscal n ON ni.id_nota = n.id_nota WHERE ni.id_produto = p.id_produto) AS ultima_ocorrencia_data,
        (SELECT MAX(n.id_nota) FROM nota_item ni JOIN nota_fiscal n ON ni.id_nota = n.id_nota WHERE ni.id_produto = p.id_produto) AS ultima_ocorrencia_id_nota,
        (SELECT n.chave_nfce FROM nota_item ni JOIN nota_fiscal n ON ni.id_nota = n.id_nota WHERE ni.id_produto = p.id_produto ORDER BY n.data_compra DESC LIMIT 1) AS ultima_chave_nfce
      FROM produto p
      LEFT JOIN oferta_supermercado o ON o.id_produto = p.id_produto
      WHERE 1=1
    `;

    const params: any[] = [];
    let i = 1;

    if (busca) {
      sql += ` AND (LOWER(p.nome_produto) LIKE LOWER($${i}) OR LOWER(p.marca) LIKE LOWER($${i}) OR p.codigo_barras LIKE LOWER($${i}))`;
      params.push(`%${busca}%`);
      i++;
    }

    if (categoria && categoria !== 'Todos') {
      sql += ` AND p.categoria = $${i}`;
      params.push(categoria as string);
      i++;
    }

    if (status_enriquecimento && status_enriquecimento !== 'Todos') {
      sql += ` AND p.status_enriquecimento = $${i}`;
      params.push(status_enriquecimento as string);
      i++;
    }

    if (status_imagem === 'sem_imagem') {
      sql += ` AND (p.imagem_url IS NULL OR p.imagem_status = 'PENDENTE')`;
    } else if (status_imagem === 'com_imagem') {
      sql += ` AND (p.imagem_url IS NOT NULL AND p.imagem_status = 'CONCLUIDO')`;
    }

    sql += ` GROUP BY p.id_produto ORDER BY p.id_produto DESC LIMIT $${i++} OFFSET $${i++}`;
    params.push(limite, offset);

    const resultado = await pool.query(sql, params);

    // Injeta a URL de fallback do Cloudinary via src/utils/imagemUtils.ts
    const produtosFormatados = resultado.rows.map((prod) => ({
      ...prod,
      imagem_exibicao: prod.imagem_url || obterPlaceholderPorCategoria(prod.categoria),
    }));

    return res.status(200).json({
      contadores: contadoresQuery.rows[0],
      produtos: produtosFormatados,
    });
  } catch (erro) {
    logger.error(
      `Erro ao buscar produtos admin: ${
        erro instanceof Error ? erro.message : String(erro)
      }`
    );
    return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
};

// -- PUT /api/admin/produtos/:id ----------------------------
export const atualizarProdutoAdmin = async (req: Request, res: Response) => {
    console.log('ENTROU atualizarProdutoAdmin');

  const { id } = req.params;
  console.log('ID', id);
console.log(req.body);
const {
  nome_produto,
  marca,
  categoria,
  peso,
  unidade_medida,
  imagem_url,
  status_enriquecimento
} = req.body;
  try {
    const nomeNormalizado = nome_produto ? nome_produto.trim().toUpperCase() : null;
    const statusImagemNovo = imagem_url ? 'CONCLUIDO' : 'PENDENTE';
    console.log('ANTES UPDATE');
    await pool.query(
      `UPDATE produto 
       SET nome_produto = $1, 
           nome_normalizado = $2, 
           marca = $3, 
           categoria = $4, 
           peso = $5, 
           unidade_medida = $6, 
           imagem_url = COALESCE($7, imagem_url),
           imagem_status = $8,
           status_enriquecimento = $9,
           data_enriquecimento = NOW(),
           enriquecido = TRUE
       WHERE id_produto = $10`,
      [
        nome_produto,
        nomeNormalizado,
        marca || null,
        categoria,
        peso || null,
        unidade_medida || null,
        imagem_url || null,
        statusImagemNovo,
        status_enriquecimento,
        id,
      ]
    );
    console.log('BODY', req.body);
console.log('STATUS', status_enriquecimento);
console.log('DEPOIS UPDATE');
    return res.status(200).json({ mensagem: 'Produto atualizado com sucesso!' });
  } catch (erro) {
  console.error(erro);

  logger.error(
    `Erro ao atualizar produto: ${
      erro instanceof Error
        ? erro.message
        : String(erro)
    }`
  );

  return res.status(500).json({
    erro: 'Erro ao atualizar produto.',
  });
}
};