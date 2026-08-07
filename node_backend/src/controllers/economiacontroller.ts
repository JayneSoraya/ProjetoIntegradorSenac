import { Request, Response } from 'express';
import { pool } from '../database';

// GET /api/economia/resumo
// Retorna todos os dados reais do usuário para a HomeScreen
export const buscarResumo = async (req: Request, res: Response) => {
  const { id_conta } = req.usuario!;

  try {
    // ── 1. Economia total do mês (soma das comparações) ────
    const economiaMes = await pool.query(
      `SELECT COALESCE(SUM(c.economia_potencial), 0) AS total
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       WHERE ca.id_usuario = $1
         AND DATE_TRUNC('month', c.data_comparacao) = DATE_TRUNC('month', NOW())`,
      [id_conta]
    );

    // ── 2. Economia potencial agora (última comparação) ────
    const ultimaComparacao = await pool.query(
      `SELECT c.economia_potencial, c.nome_supermercado_mais_barato, c.data_comparacao
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       WHERE ca.id_usuario = $1
       ORDER BY c.data_comparacao DESC
       LIMIT 1`,
      [id_conta]
    );

    // ── 3. Scans de notas feitos pelo usuário ──────────────
   
    const totalComparacoes = await pool.query(
      `SELECT COUNT(*) AS total
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       WHERE ca.id_usuario = $1`,
      [id_conta]
    );

    // ── 4. Mercado mais barato baseado no histórico real ───
    const mercadoMaisBarato = await pool.query(
      `SELECT c.nome_supermercado_mais_barato, COUNT(*) AS vezes
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       WHERE ca.id_usuario = $1
       GROUP BY c.nome_supermercado_mais_barato
       ORDER BY vezes DESC
       LIMIT 1`,
      [id_conta]
    );

    // ── 5. Economia acumulada total (histórico completo) ───
    const economiaTotal = await pool.query(
      `SELECT COALESCE(SUM(c.economia_potencial), 0) AS total
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       WHERE ca.id_usuario = $1`,
      [id_conta]
    );

    // ── 6. EconoCoins — calculado com base na atividade ───
    const scans = parseInt(totalComparacoes.rows[0].total);
    let coins = 50; // bônus de boas-vindas
    coins += scans * 100; // 100 coins por comparação
    if (scans >= 5)  coins += 200;
    if (scans >= 20) coins += 300;

    // ── 7. Progresso do mapa de preços ────────────────────
    // Conta quantos produtos distintos têm oferta cadastrada
    const progressoMapa = await pool.query(
      `SELECT COUNT(DISTINCT id_produto) AS produtos_com_preco
       FROM oferta_supermercado`
    );

    const meta = 50; // meta de produtos para mapa completo
    const produtosComPreco = parseInt(progressoMapa.rows[0].produtos_com_preco);

    return res.status(200).json({
      economia_mes: parseFloat(economiaMes.rows[0].total),
      economia_total: parseFloat(economiaTotal.rows[0].total),
      economia_potencial: parseFloat(
        ultimaComparacao.rows[0]?.economia_potencial ?? 0
      ),
      mercado_mais_barato:
        mercadoMaisBarato.rows[0]?.nome_supermercado_mais_barato ?? null,
      total_comparacoes: scans,
      econo_coins: coins,
      mapa: {
        produtos_com_preco: produtosComPreco,
        meta,
        progresso: Math.min(produtosComPreco / meta, 1),
      },
    });
  } catch (erro) {
    console.error('❌ Erro ao buscar resumo:', erro);
    return res.status(500).json({ erro: 'Erro ao buscar dados.' });
  }
};