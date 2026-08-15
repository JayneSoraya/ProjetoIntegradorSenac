import { Request, Response } from 'express';
import { pool } from '../database';

// GET /api/progresso
// Retorna o progresso do mapa de preços para o widget Zeigarnik
export const buscarProgresso = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  const { id_usuario } = req.usuario;

  try {
    // ── 1. Scans feitos pelo usuário ───────────────────────
    // Conta notas fiscais escaneadas pelo usuário
    const scansResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM nota_fiscal
       WHERE id_usuario = $1`,
      [id_usuario]
    );
    const scansFeitos = parseInt(scansResult.rows[0].total);

    // ── 2. Produtos com preço no banco ─────────────────────
    // Conta produtos distintos que têm ao menos uma oferta
    const produtosResult = await pool.query(
      `SELECT COUNT(DISTINCT id_produto) AS total
       FROM oferta_supermercado`
    );
    const produtosComPreco = parseInt(produtosResult.rows[0].total);

    // ── 3. Total de mercados ativos ────────────────────────
    const mercadosResult = await pool.query(
      `SELECT COUNT(*) AS total FROM supermercado WHERE esta_aberto = true`
    );
    const totalMercados = parseInt(mercadosResult.rows[0].total);

    // ── 4. Metas ───────────────────────────────────────────
    const metaScans    = 10;  // scans para desbloquear comparação completa
    const metaProdutos = 50;  // produtos para mapa completo

    // ── 5. Cálculo do progresso ────────────────────────────
    // Combina progresso de scans (80%) + produtos (20%)
    const progressoScans = Math.min(scansFeitos / metaScans, 1);
    const progressoProdutos = Math.min(produtosComPreco / metaProdutos, 1);
    const progresso = (progressoScans * 0.8) + (progressoProdutos * 0.2);
    const scansRestantes = Math.max(0, metaScans - scansFeitos);
    const mensagemProgresso =
        scansRestantes > 0
            ? `Faltam ${scansRestantes} ${scansRestantes === 1 ? 'scan' : 'scans'} para desbloquear a comparação com TODOS os mercados.`
            : '🎉 Você desbloqueou a comparação completa da cidade!';

    // ── 6. Economia total da cidade (prova social) ─────────
    // Soma todas as economias potenciais das comparações
 //   const economiaResult = await pool.query(
   //   `SELECT COALESCE(SUM(economia_potencial), 0) AS total
   //    FROM comparacao`
 //   );
   // const economiaCidade = parseFloat(economiaResult.rows[0].total);
const economiaCidade = 0;
    return res.status(200).json({
      progresso:          Math.round(progresso * 100) / 100,
      scans_feitos:       scansFeitos,
      meta_scans:         metaScans,
      produtos_com_preco: produtosComPreco,
      meta_produtos:      metaProdutos, 
      scans_restantes: scansRestantes,   
      mensagem_progresso: mensagemProgresso,
      economia_cidade:    economiaCidade,
       total_mercados:     totalMercados,
      frase_social:
        economiaCidade > 0
          ? `Moradores de Araraquara já economizaram R$ ${economiaCidade.toFixed(2)} escaneando notas. Você ainda não.`
          : 'Seja o primeiro a mapear os preços de Araraquara!',
    });
  } catch (erro: any) {
    console.error('❌ Erro ao buscar progresso:', erro.message);
    return res.status(500).json({ erro: 'Erro ao buscar progresso.' });
  }
};