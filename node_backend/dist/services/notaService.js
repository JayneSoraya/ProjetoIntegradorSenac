"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotaService = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const database_1 = require("../database");
function classificarProduto(nome) {
    const n = nome.toLowerCase();
    if (/refrig|suco|agua|mineral|cerveja|vinho|achoc|cafe|cha |chá |energet|isoton|whisky|vodka|rum|drink|guarana|coca|pepsi|fanta/.test(n))
        return 'Bebidas';
    if (/deterg|sanit|desinf|limpeza|amaciante|sabao|sabonete|shampoo|creme|dental|escova|papel hig|fralda|absorv|desodor|perfume/.test(n))
        return 'Higiene e Limpeza';
    if (/peixe|frango|carne|file|linguica|salsicha|presunto|bacon|atum|sardinha|camarao/.test(n))
        return 'Carnes e Peixes';
    if (/arroz|feijao|macarr|farinha|acucar|sal|oleo|azeite|vinagre|molho|extrato|tempero|maionese|ketchup|mostarda|cuscuz/.test(n))
        return 'Alimentos';
    if (/biscoito|bolacha|salgadin|batata palh|chocolate|bala |chicle|sorvete|wafer/.test(n))
        return 'Snacks';
    if (/pao |torrada|bolo |massa |croissant/.test(n))
        return 'Padaria';
    if (/queijo|iogurt|iogurte|manteiga|margarina|requeijao|nata|creme de leite|leite/.test(n))
        return 'Laticínios';
    if (/banana|maca|maçã|laranja|limao|limão|uva|mamao|mamão|tomate|alface|cenoura|batata|cebola|alho/.test(n))
        return 'Hortifruti';
    return 'Não classificado';
}
class NotaService {
    static async processarNotaPorUrl(urlQrCode, idUsuario) {
        // 1. Busca HTML da SEFAZ SP seguindo redirect
        const resposta = await axios_1.default.get(urlQrCode, {
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'pt-BR,pt;q=0.9',
            },
            timeout: 15000,
        });
        const $ = cheerio.load(resposta.data);
        const textoPagina = $.text();
        const totalMatch = textoPagina.match(/Valor a pagar R\$:\s*([\d,.]+)/);
        const valorTotalNota = totalMatch
            ? parseFloat(totalMatch[1].replace('.', '').replace(',', '.'))
            : 0;
        const emissaoMatch = textoPagina.match(/Emissão:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/);
        const dataEmissaoDB = emissaoMatch
            ? new Date(emissaoMatch[1].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'))
            : new Date();
        // 2. Extrai dados do emitente
        const nomeEmitente = $('#u20').text().trim();
        let cnpj = '';
        let endereco = '';
        $('.text').each((_, el) => {
            const texto = $(el).text().trim();
            if (texto.includes('CNPJ:')) {
                cnpj = texto.replace('CNPJ:', '').replace(/\D/g, '').trim();
            }
            else if (texto.includes('RUA') || texto.includes('AV') || texto.includes('ALAMEDA')) {
                endereco = texto.replace(/\s+/g, ' ').trim();
            }
        });
        if (!cnpj) {
            throw new Error('Não foi possível ler o CNPJ da nota.');
        }
        // 3. Salva ou localiza o supermercado
        const supExiste = await database_1.pool.query('SELECT id_supermercado FROM supermercado WHERE cnpj = $1', [cnpj]);
        let idSupermercado;
        if (supExiste.rows.length > 0) {
            idSupermercado = supExiste.rows[0].id_supermercado;
        }
        else {
            const novoSup = await database_1.pool.query(`INSERT INTO supermercado (cnpj, nome_fantasia, endereco_completo)
         VALUES ($1, $2, $3) RETURNING id_supermercado`, [cnpj, nomeEmitente, endereco]);
            idSupermercado = novoSup.rows[0].id_supermercado;
        }
        // 4. Coleta produtos
        const itensDaNota = [];
        $('#tabResult tr').filter((_, row) => {
            return $(row).find('.txtTit').length > 0;
        }).each((_, row) => {
            const nome = $(row).find('.txtTit').first().text().trim();
            const qtdTexto = $(row).find('.Rqtd').text().replace(/[^\d,]/g, '').replace(',', '.');
            const quantidade = parseFloat(qtdTexto) || 1;
            const unidade = $(row).find('.RUN').text().replace('UN:', '').trim();
            const codigoRaw = $(row).find('.RCod').text().replace(/\D/g, '').trim();
            const precoRaw = $(row).find('.RvlUnit').text().replace(/[^\d,]/g, '').replace(',', '.');
            const preco = parseFloat(precoRaw);
            if (!nome || isNaN(preco) || preco <= 0)
                return;
            itensDaNota.push({
                nome,
                codigo: codigoRaw || `${cnpj}_${nome.substring(0, 15).replace(/\s/g, '_')}`,
                preco,
                quantidade,
                unidade,
            });
        });
        // 5. Salva nota, itens e ofertas no banco
        const notaResult = await database_1.pool.query(`INSERT INTO nota_fiscal (id_usuario, id_supermercado, data_compra, valor_total, chave_nfce)
       VALUES ($1, $2, $3, $4, $5) RETURNING id_nota`, [idUsuario, idSupermercado, dataEmissaoDB, valorTotalNota, urlQrCode]);
        const idNota = notaResult.rows[0].id_nota;
        const produtosSalvos = [];
        for (const item of itensDaNota) {
            let idProduto;
            const categoria = classificarProduto(item.nome);
            const prodExiste = await database_1.pool.query('SELECT id_produto FROM produto WHERE codigo_barras = $1', [item.codigo]);
            if (prodExiste.rows.length > 0) {
                idProduto = prodExiste.rows[0].id_produto;
            }
            else {
                const novoProd = await database_1.pool.query(`INSERT INTO produto (codigo_barras, nome_produto, categoria)
           VALUES ($1, $2, $3) RETURNING id_produto`, [item.codigo, item.nome, categoria]);
                idProduto = novoProd.rows[0].id_produto;
            }
            await database_1.pool.query(`INSERT INTO nota_item (id_nota, id_produto, quantidade, unidade, valor_unitario)
         VALUES ($1, $2, $3, $4, $5)`, [idNota, idProduto, item.quantidade, item.unidade, item.preco]);
            await database_1.pool.query(`INSERT INTO oferta_supermercado (id_supermercado, id_produto, preco_atual, data_atualizacao)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (id_supermercado, id_produto)
         DO UPDATE SET preco_atual = $3, data_atualizacao = NOW()`, [idSupermercado, idProduto, item.preco]);
            produtosSalvos.push(item.nome);
        }
        return {
            mensagem: 'Nota processada com sucesso!',
            supermercado: nomeEmitente,
            produtos_salvos: produtosSalvos.length,
            produtos: produtosSalvos,
        };
    }
}
exports.NotaService = NotaService;
