import { pool } from '../database';
import { ProdutoRepository } from "../repositories/produtoRepository";

export interface FiltrosProdutoDTO {
  busca?: string;
  categoria?: string;
  page?: number;
  limit?: number;
}

export class ProdutoService {
  static async buscar(termo: string) {
    return await ProdutoRepository.buscar(termo);
  }

  static async buscarDetalhe(id: number) {
    return await ProdutoRepository.buscarDetalhe(id);
  }

  /**
   * RF05 — Busca avançada de produtos com filtros de nome/marca, categoria e paginação.
   */
  static async buscarComFiltros(filtros: FiltrosProdutoDTO) {
    const { busca, categoria, page = 1, limit = 50 } = filtros;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT
        p.id_produto,
        p.codigo_barras,
        p.nome_produto,
        p.marca,
        p.categoria,
        p.peso,
        p.unidade_medida,
        p.imagem_url,
        MIN(o.preco_atual)                         AS preco,
        AVG(o.preco_atual)                         AS preco_medio,
        MAX(o.preco_atual) - MIN(o.preco_atual)    AS variacao_preco
      FROM produto p
      LEFT JOIN oferta_supermercado o ON o.id_produto = p.id_produto
      WHERE 1=1
    `;

    const params: any[] = [];
    let i = 1;

    if (busca) {
      sql += ` AND (
        LOWER(p.nome_produto) LIKE LOWER($${i})
        OR LOWER(p.marca)     LIKE LOWER($${i})
      )`;
      params.push(`%${busca}%`);
      i++;
    }

    if (categoria && categoria !== 'Todos') {
      sql += ` AND p.categoria = $${i}`;
      params.push(categoria);
      i++;
    }

    sql += `
      GROUP BY
        p.id_produto,
        p.codigo_barras,
        p.nome_produto,
        p.marca,
        p.categoria,
        p.peso,
        p.unidade_medida,
        p.imagem_url
      ORDER BY p.id_produto ASC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    params.push(limit, offset);

    const resultado = await pool.query(sql, params);
    return resultado.rows;
  }

  /**
   * RF07 — Busca os detalhes completos de um produto específico com base no ID.
   */
  static async buscarDetalheCompleto(id: number) {
    const resultado = await pool.query(
      `SELECT
        p.id_produto,
        p.codigo_barras,
        p.nome_produto,
        p.marca,
        p.categoria,
        p.peso,
        p.unidade_medida,
        p.imagem_url,
        MIN(o.preco_atual)                         AS preco,
        AVG(o.preco_atual)                         AS preco_medio,
        MAX(o.preco_atual) - MIN(o.preco_atual)    AS variacao_preco
       FROM produto p
       LEFT JOIN oferta_supermercado o ON o.id_produto = p.id_produto
       WHERE p.id_produto = $1
       GROUP BY
         p.id_produto,
         p.codigo_barras,
         p.nome_produto,
         p.marca,
         p.categoria,
         p.peso,
         p.unidade_medida,
         p.imagem_url`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return null;
    }

    return resultado.rows[0];
  }

  static normalizarNome(nome: string): string {
    if (!nome) return '';

    return nome
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
  }

  static extrairMedida(nome: string) {
    if (!nome) return null;

    const match = nome.match(/(\d+(?:[.,]\d+)?)\s*(KG|G|ML|L|LI|UN|CM)\b/i);

    if (match) {
      let unidade = match[2].toUpperCase();
      if (unidade === 'LI') unidade = 'L';

      return {
        quantidade: Number(match[1].replace(',', '.')),
        unidade: unidade,
      };
    }

    const somenteUnidade = nome.match(/\b(KG|G|ML|L|LI|UN)\b/i);

    if (somenteUnidade) {
      let unidade = somenteUnidade[1].toUpperCase();
      if (unidade === 'LI') unidade = 'L';

      return {
        quantidade: null,
        unidade: unidade,
      };
    }

    return null;
  }

  static classificarCategoria(nome: string): string {
    if (!nome) return 'Não classificado';
    
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
}