import { pool } from '../database';

export class ProgressoService {
  static async obterProgresso(idUsuario: number) {
    const result = await pool.query(
      'SELECT * FROM progresso_usuario WHERE id_usuario = $1',
      [idUsuario]
    );
    return result.rows[0] || { nivel: 1, pontos: 0 };
  }

  static async buscarProgressoZeigarnik(idUsuario: number) {
    // ── 1. Scans feitos pelo usuário ───────────────────────
    const scansResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM nota_fiscal
       WHERE id_usuario = $1`,
      [idUsuario]
    );
    const scansFeitos = parseInt(scansResult.rows[0].total);

    // ── 2. Produtos com preço no banco ─────────────────────
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
    const metaScans = 10;
    const metaProdutos = 50;

    // ── 5. Cálculo do progresso ────────────────────────────
    const progressoScans = Math.min(scansFeitos / metaScans, 1);
    const progressoProdutos = Math.min(produtosComPreco / metaProdutos, 1);
    const progresso = (progressoScans * 0.8) + (progressoProdutos * 0.2);
    const scansRestantes = Math.max(0, metaScans - scansFeitos);
    const mensagemProgresso =
      scansRestantes > 0
        ? `Faltam ${scansRestantes} ${scansRestantes === 1 ? 'scan' : 'scans'} para desbloquear a comparação com TODOS os mercados.`
        : '🎉 Você desbloqueou a comparação completa da cidade!';

    const economiaCidade = 0;

    return {
      progresso: Math.round(progresso * 100) / 100,
      scans_feitos: scansFeitos,
      meta_scans: metaScans,
      produtos_com_preco: produtosComPreco,
      meta_produtos: metaProdutos,
      scans_restantes: scansRestantes,
      mensagem_progresso: mensagemProgresso,
      economia_cidade: economiaCidade,
      total_mercados: totalMercados,
      frase_social:
        economiaCidade > 0
          ? `Moradores de Araraquara já economizaram R$ ${economiaCidade.toFixed(2)} escaneando notas. Você ainda não.`
          : 'Seja o primeiro a mapear os preços de Araraquara!',
    };
  }
}