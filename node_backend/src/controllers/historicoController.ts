import { Request, Response } from 'express';
import { pool } from '../database';


// Lista todas as notas fiscais do usuário logado
export const listarCompras = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  const { id_usuario } = req.usuario;

  try {
    const resultado = await pool.query(
      `
      SELECT
        nf.id_nota,
        nf.data_compra,
        nf.valor_total,
        nf.chave_nfce,
        s.nome_fantasia   AS supermercado,
        s.endereco_completo,
        COUNT(ni.id_item) AS total_itens
      FROM nota_fiscal nf
      INNER JOIN supermercado s ON s.id_supermercado = nf.id_supermercado
      LEFT JOIN nota_item ni ON ni.id_nota = nf.id_nota
      WHERE nf.id_usuario = $1
      GROUP BY
        nf.id_nota,
        nf.data_compra,
        nf.valor_total,
        nf.chave_nfce,
        s.nome_fantasia,
        s.endereco_completo
      ORDER BY nf.data_compra DESC
      `,
      [id_usuario]
    );

    return res.status(200).json(resultado.rows);
  } catch (erro: any) {
    console.error('❌ Erro ao listar compras:', erro.message);
    return res.status(500).json({ erro: 'Erro ao buscar histórico de compras.' });
  }
};

// Detalhe de uma nota: lista todos os itens comprados
export const detalheCompra = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  const { id } = req.params;
  const { id_usuario } = req.usuario;

  try {
    // Confirma que a nota pertence ao usuário logado
    const notaExiste = await pool.query(
      `SELECT id_nota FROM nota_fiscal
       WHERE id_nota = $1 AND id_usuario = $2`,
      [id, id_usuario]
    );

    if (notaExiste.rows.length === 0) {
      return res.status(404).json({ erro: 'Nota não encontrada.' });
    }

    // Cabeçalho da nota
    const cabecalho = await pool.query(
      `
      SELECT
        nf.id_nota,
        nf.data_compra,
        nf.valor_total,
        s.nome_fantasia AS supermercado,
        s.endereco_completo
      FROM nota_fiscal nf
      INNER JOIN supermercado s ON s.id_supermercado = nf.id_supermercado
      WHERE nf.id_nota = $1
      `,
      [id]
    );

    // Itens da nota
    const itens = await pool.query(
      `
      SELECT
        ni.id_produto,
        p.nome_produto,
        p.categoria,
        ni.quantidade,
        ni.unidade,
        ni.valor_unitario,
        (ni.quantidade * ni.valor_unitario) AS subtotal
      FROM nota_item ni
      INNER JOIN produto p ON p.id_produto = ni.id_produto
      WHERE ni.id_nota = $1
      ORDER BY p.nome_produto
      `,
      [id]
    );

    return res.status(200).json({
      nota: cabecalho.rows[0],
      itens: itens.rows,
    });
  } catch (erro: any) {
    console.error('❌ Erro ao buscar detalhe da compra:', erro.message);
    return res.status(500).json({ erro: 'Erro ao buscar detalhe da compra.' });
  }
};

// Histórico de variação de preço de um produto específico
export const historicoPrecoProduto = async (req: Request, res: Response) => {
  const { id_produto } = req.params;

  try {
    // Preço atual em cada supermercado
    const precoAtual = await pool.query(
      `
      SELECT
        s.nome_fantasia AS supermercado,
        o.preco_atual,
        o.data_atualizacao
      FROM oferta_supermercado o
      INNER JOIN supermercado s ON s.id_supermercado = o.id_supermercado
      WHERE o.id_produto = $1
      ORDER BY o.preco_atual ASC
      `,
      [id_produto]
    );

    // Histórico de preços anteriores (via trigger)
    const historico = await pool.query(
      `
      SELECT
        s.nome_fantasia AS supermercado,
        hp.preco,
        hp.registrado_em
      FROM historico_preco hp
      INNER JOIN supermercado s ON s.id_supermercado = hp.id_supermercado
      WHERE hp.id_produto = $1
      ORDER BY hp.registrado_em DESC
      LIMIT 50
      `,
      [id_produto]
    );

    // Nome do produto
    const produto = await pool.query(
      `SELECT nome_produto, categoria FROM produto WHERE id_produto = $1`,
      [id_produto]
    );

    if (produto.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    return res.status(200).json({
      produto: produto.rows[0],
      precos_atuais: precoAtual.rows,
      historico: historico.rows,
    });
  } catch (erro: any) {
    console.error('❌ Erro ao buscar histórico de preços:', erro.message);
    return res.status(500).json({ erro: 'Erro ao buscar histórico de preços.' });
  }
};

// Resumo de economia do usuário


export const resumoEconomia = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  const { id_usuario } = req.usuario;

  try {
    // Total gasto por mês
    const gastoMensal = await pool.query(
      `
      SELECT
        DATE_TRUNC('month', data_compra) AS mes,
        SUM(valor_total)                  AS total_gasto,
        COUNT(id_nota)                    AS total_compras
      FROM nota_fiscal
      WHERE id_usuario = $1
      GROUP BY mes
      ORDER BY mes DESC
      LIMIT 6
      `,
      [id_usuario]
    );

    // Total gasto geral
    const totalGeral = await pool.query(
      `SELECT COALESCE(SUM(valor_total), 0) AS total
       FROM nota_fiscal WHERE id_usuario = $1`,
      [id_usuario]
    );

    // Supermercado mais frequentado
    const favoritoResult = await pool.query(
      `
      SELECT s.nome_fantasia, COUNT(*) AS visitas
      FROM nota_fiscal nf
      INNER JOIN supermercado s ON s.id_supermercado = nf.id_supermercado
      WHERE nf.id_usuario = $1
      GROUP BY s.nome_fantasia
      ORDER BY visitas DESC
      LIMIT 1
      `,
      [id_usuario]
    );

    return res.status(200).json({
      gasto_mensal: gastoMensal.rows,
      total_geral: parseFloat(totalGeral.rows[0].total),
      supermercado_favorito: favoritoResult.rows[0]?.nome_fantasia ?? null,
      total_notas: gastoMensal.rows.reduce(
        (acc, row) => acc + parseInt(row.total_compras), 0
      ),
    });
  } catch (erro: any) {
    console.error('❌ Erro ao buscar resumo:', erro.message);
    return res.status(500).json({ erro: 'Erro ao buscar resumo.' });
  }
};