"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EconomiaService = void 0;
const database_1 = require("../database");
class EconomiaService {
    static async calcularEconomia(idUsuario) {
        const result = await database_1.pool.query('SELECT SUM(economia_total) as total_economia, SUM(carbono_poupado) as total_carbono FROM historico_compras WHERE id_usuario = $1', [idUsuario]);
        return result.rows[0] || { total_economia: 0, total_carbono: 0 };
    }
    static async obterResumoUsuario(idConta) {
        // ── 1. Economia total do mês ────
        const economiaMes = await database_1.pool.query(`SELECT COALESCE(SUM(c.economia_potencial), 0) AS total
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       WHERE ca.id_usuario = $1
         AND DATE_TRUNC('month', c.data_comparacao) = DATE_TRUNC('month', NOW())`, [idConta]);
        // ── 2. Economia potencial agora (última comparação) ────
        const ultimaComparacao = await database_1.pool.query(`SELECT c.economia_potencial, c.nome_supermercado_mais_barato, c.data_comparacao
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       WHERE ca.id_usuario = $1
       ORDER BY c.data_comparacao DESC
       LIMIT 1`, [idConta]);
        // ── 3. Total de comparações ────
        const totalComparacoes = await database_1.pool.query(`SELECT COUNT(*) AS total
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       WHERE ca.id_usuario = $1`, [idConta]);
        // ── 4. Mercado mais barato baseado no histórico real ────
        const mercadoMaisBarato = await database_1.pool.query(`SELECT c.nome_supermercado_mais_barato, COUNT(*) AS vezes
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       WHERE ca.id_usuario = $1
       GROUP BY c.nome_supermercado_mais_barato
       ORDER BY vezes DESC
       LIMIT 1`, [idConta]);
        // ── 5. Economia acumulada total ────
        const economiaTotal = await database_1.pool.query(`SELECT COALESCE(SUM(c.economia_potencial), 0) AS total
       FROM comparacao c
       INNER JOIN carrinho ca ON ca.id_carrinho = c.id_carrinho
       WHERE ca.id_usuario = $1`, [idConta]);
        // ── 6. EconoCoins — calculado com base na atividade ────
        const scans = parseInt(totalComparacoes.rows[0].total);
        let coins = 50; // bônus de boas-vindas
        coins += scans * 100; // 100 coins por comparação
        if (scans >= 5)
            coins += 200;
        if (scans >= 20)
            coins += 300;
        // ── 7. Progresso do mapa de preços ────
        const progressoMapa = await database_1.pool.query(`SELECT COUNT(DISTINCT id_produto) AS produtos_com_preco
       FROM oferta_supermercado`);
        const meta = 50; // meta de produtos para mapa completo
        const produtosComPreco = parseInt(progressoMapa.rows[0].produtos_com_preco);
        return {
            economia_mes: parseFloat(economiaMes.rows[0].total),
            economia_total: parseFloat(economiaTotal.rows[0].total),
            economia_potencial: parseFloat(ultimaComparacao.rows[0]?.economia_potencial ?? 0),
            mercado_mais_barato: mercadoMaisBarato.rows[0]?.nome_supermercado_mais_barato ?? null,
            total_comparacoes: scans,
            econo_coins: coins,
            mapa: {
                produtos_com_preco: produtosComPreco,
                meta,
                progresso: Math.min(produtosComPreco / meta, 1),
            },
        };
    }
}
exports.EconomiaService = EconomiaService;
