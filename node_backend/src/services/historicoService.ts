import { pool } from '../database';
import { Paginacao, arredondarMoeda, subtotalItem, totalDaNota } from '../domain/historico';

export interface CompraResumo {
  id_nota: number;
  data_compra: string | null;
  id_supermercado: number;
  supermercado: string;
  total: number;
  total_itens: number;
}

export interface CompraItem {
  id_nota_item: number;
  id_produto: number | null;
  nome_produto: string;
  codigo_barras: string | null;
  categoria: string | null;
  unidade: string | null;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface CompraDetalhe {
  nota: {
    id_nota: number;
    data_compra: string | null;
    id_supermercado: number;
    supermercado: string;
    endereco: string | null;
    total: number;
    total_itens: number;
  };
  itens: CompraItem[];
}

export interface HistoricoPrecoProduto {
  produto: {
    id_produto: number;
    nome_produto: string;
    marca: string | null;
    categoria: string | null;
  };
  precos_atuais: Array<{
    id_supermercado: number;
    supermercado: string;
    preco_atual: number;
    preco_fidelidade: number | null;
    fonte: string;
    data_atualizacao: string | null;
  }>;
  minhas_compras: Array<{
    id_nota: number;
    id_supermercado: number;
    supermercado: string;
    data_compra: string | null;
    quantidade: number;
    preco_unitario: number;
  }>;
}

function toIso(value: Date | string | null): string | null {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export class HistoricoService {
  /** Notas fiscais válidas importadas pelo usuário, da mais recente para a mais antiga. */
  static async listarCompras(userId: number, paginacao: Paginacao): Promise<CompraResumo[]> {
    const result = await pool.query<{
      id_nota: number;
      data_compra: Date | string | null;
      id_supermercado: number;
      supermercado: string;
      total: string | number;
      total_itens: number;
    }>(
      `SELECT
         n.id_nota,
         COALESCE(n.data_emissao, n.processada_em) AS data_compra,
         s.id_supermercado,
         s.nome_fantasia AS supermercado,
         COALESCE(SUM(ROUND(ni.quantidade * ni.preco_unitario, 2)), 0) AS total,
         COUNT(ni.id_nota_item) AS total_itens
       FROM nota_fiscal n
       INNER JOIN supermercado s ON s.id_supermercado = n.id_supermercado
       LEFT JOIN nota_item ni ON ni.id_nota = n.id_nota
       WHERE n.id_usuario = $1
         AND n.status = 'VALIDA'
       GROUP BY n.id_nota, s.id_supermercado, s.nome_fantasia
       ORDER BY COALESCE(n.data_emissao, n.processada_em) DESC, n.id_nota DESC
       LIMIT $2 OFFSET $3`,
      [userId, paginacao.limite, paginacao.deslocamento],
    );

    return result.rows.map((row) => ({
      id_nota: row.id_nota,
      data_compra: toIso(row.data_compra),
      id_supermercado: row.id_supermercado,
      supermercado: row.supermercado,
      total: arredondarMoeda(Number(row.total)),
      total_itens: Number(row.total_itens),
    }));
  }

  /** Detalhe de uma nota. Retorna null quando a nota não existe ou pertence a outro usuário. */
  static async detalharCompra(userId: number, idNota: number): Promise<CompraDetalhe | null> {
    const header = await pool.query<{
      id_nota: number;
      data_compra: Date | string | null;
      id_supermercado: number;
      supermercado: string;
      endereco: string | null;
    }>(
      `SELECT
         n.id_nota,
         COALESCE(n.data_emissao, n.processada_em) AS data_compra,
         s.id_supermercado,
         s.nome_fantasia AS supermercado,
         s.endereco_completo AS endereco
       FROM nota_fiscal n
       INNER JOIN supermercado s ON s.id_supermercado = n.id_supermercado
       WHERE n.id_nota = $1
         AND n.id_usuario = $2
         AND n.status = 'VALIDA'`,
      [idNota, userId],
    );

    const nota = header.rows[0];
    if (!nota) return null;

    const items = await pool.query<{
      id_nota_item: number;
      id_produto: number | null;
      nome_produto: string;
      codigo_barras: string | null;
      categoria: string | null;
      unidade: string | null;
      quantidade: string | number;
      preco_unitario: string | number;
    }>(
      `SELECT
         ni.id_nota_item,
         ni.id_produto,
         ni.nome_produto,
         ni.codigo_barras,
         p.categoria,
         p.unidade_medida AS unidade,
         ni.quantidade,
         ni.preco_unitario
       FROM nota_item ni
       LEFT JOIN produto p ON p.id_produto = ni.id_produto
       WHERE ni.id_nota = $1
       ORDER BY ni.nome_produto ASC, ni.id_nota_item ASC`,
      [idNota],
    );

    const itens: CompraItem[] = items.rows.map((row) => {
      const quantidade = Number(row.quantidade);
      const precoUnitario = Number(row.preco_unitario);
      return {
        id_nota_item: row.id_nota_item,
        id_produto: row.id_produto,
        nome_produto: row.nome_produto,
        codigo_barras: row.codigo_barras,
        categoria: row.categoria,
        unidade: row.unidade,
        quantidade,
        preco_unitario: precoUnitario,
        subtotal: subtotalItem({ quantidade, preco_unitario: precoUnitario }),
      };
    });

    return {
      nota: {
        id_nota: nota.id_nota,
        data_compra: toIso(nota.data_compra),
        id_supermercado: nota.id_supermercado,
        supermercado: nota.supermercado,
        endereco: nota.endereco,
        total: totalDaNota(itens),
        total_itens: itens.length,
      },
      itens,
    };
  }

  /**
   * Preços atuais por supermercado aprovado (oferta_supermercado) e as compras do próprio
   * usuário para o produto. Itens de notas de outros usuários nunca são expostos.
   */
  static async precosDoProduto(userId: number, idProduto: number): Promise<HistoricoPrecoProduto | null> {
    const product = await pool.query<{
      id_produto: number;
      nome_produto: string;
      marca: string | null;
      categoria: string | null;
    }>(
      `SELECT id_produto, nome_produto, marca, categoria
       FROM produto
       WHERE id_produto = $1`,
      [idProduto],
    );
    const produto = product.rows[0];
    if (!produto) return null;

    const [offers, purchases] = await Promise.all([
      pool.query<{
        id_supermercado: number;
        supermercado: string;
        preco_atual: string | number;
        preco_fidelidade: string | number | null;
        fonte: string;
        data_atualizacao: Date | string | null;
      }>(
        `SELECT
           s.id_supermercado,
           s.nome_fantasia AS supermercado,
           o.preco_atual,
           o.preco_fidelidade,
           o.fonte,
           o.data_atualizacao
         FROM oferta_supermercado o
         INNER JOIN supermercado s ON s.id_supermercado = o.id_supermercado
         WHERE o.id_produto = $1
           AND s.status_cadastro = 'APROVADO'
         ORDER BY o.preco_atual ASC, s.nome_fantasia ASC`,
        [idProduto],
      ),
      pool.query<{
        id_nota: number;
        id_supermercado: number;
        supermercado: string;
        data_compra: Date | string | null;
        quantidade: string | number;
        preco_unitario: string | number;
      }>(
        `SELECT
           n.id_nota,
           s.id_supermercado,
           s.nome_fantasia AS supermercado,
           COALESCE(n.data_emissao, n.processada_em) AS data_compra,
           ni.quantidade,
           ni.preco_unitario
         FROM nota_item ni
         INNER JOIN nota_fiscal n ON n.id_nota = ni.id_nota
         INNER JOIN supermercado s ON s.id_supermercado = n.id_supermercado
         WHERE ni.id_produto = $1
           AND n.id_usuario = $2
           AND n.status = 'VALIDA'
         ORDER BY COALESCE(n.data_emissao, n.processada_em) DESC, ni.id_nota_item DESC
         LIMIT 50`,
        [idProduto, userId],
      ),
    ]);

    return {
      produto,
      precos_atuais: offers.rows.map((row) => ({
        id_supermercado: row.id_supermercado,
        supermercado: row.supermercado,
        preco_atual: Number(row.preco_atual),
        preco_fidelidade: row.preco_fidelidade == null ? null : Number(row.preco_fidelidade),
        fonte: row.fonte,
        data_atualizacao: toIso(row.data_atualizacao),
      })),
      minhas_compras: purchases.rows.map((row) => ({
        id_nota: row.id_nota,
        id_supermercado: row.id_supermercado,
        supermercado: row.supermercado,
        data_compra: toIso(row.data_compra),
        quantidade: Number(row.quantidade),
        preco_unitario: Number(row.preco_unitario),
      })),
    };
  }
}
