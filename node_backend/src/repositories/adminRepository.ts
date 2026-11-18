import { pool } from '../database';

export class AdminRepository {
  static async listarMercados() {
    return pool.query(`
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
  }

  static async cadastrarMercado(cnpj: string, nome_fantasia: string, endereco_completo: string) {
    return pool.query(
      `INSERT INTO supermercado (cnpj, nome_fantasia, endereco_completo)
       VALUES ($1, $2, $3) RETURNING *`,
      [cnpj, nome_fantasia, endereco_completo]
    );
  }

  static async editarMercado(id: string, nome_fantasia: string, endereco_completo: string, esta_aberto: boolean) {
    return pool.query(
      `UPDATE supermercado
       SET nome_fantasia = $1, endereco_completo = $2, esta_aberto = $3
       WHERE id_supermercado = $4 RETURNING *`,
      [nome_fantasia, endereco_completo, esta_aberto, id]
    );
  }

  static async removerMercado(id: string) {
    return pool.query(
      'DELETE FROM supermercado WHERE id_supermercado = $1',
      [id]
    );
  }

  static async listarUsuarios(busca?: string) {
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
             
    return pool.query(sql, params);
  }

  static async bloquearUsuario(id: string, novoStatus: boolean) {
    return pool.query(
      'UPDATE conta SET status_conta = $1 WHERE id_conta = $2',
      [novoStatus, id]
    );
  }

  static async obterContadoresProdutos() {
    return pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status_enriquecimento = 'PENDENTE') AS pendente,
        COUNT(*) FILTER (WHERE status_enriquecimento = 'ENRIQUECIDO') AS enriquecido,
        COUNT(*) FILTER (WHERE status_enriquecimento = 'CONCLUIDO') AS concluido,
        COUNT(*) FILTER (WHERE imagem_url IS NULL OR imagem_status = 'PENDENTE') AS sem_imagem,
        COUNT(*) FILTER (WHERE imagem_url IS NOT NULL AND imagem_status = 'CONCLUIDO') AS com_imagem,
        COUNT(*) AS total_geral
      FROM produto
    `);
  }

  static async listarProdutosAdmin(
    busca?: string,
    categoria?: string,
    statusEnriquecimento?: string,
    statusImagem?: string,
    limite = 20,
    offset = 0
  ) {
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
      params.push(categoria);
      i++;
    }

    if (statusEnriquecimento && statusEnriquecimento !== 'Todos') {
      sql += ` AND p.status_enriquecimento = $${i}`;
      params.push(statusEnriquecimento);
      i++;
    }

    if (statusImagem === 'sem_imagem') {
      sql += ` AND (p.imagem_url IS NULL OR p.imagem_status = 'PENDENTE')`;
    } else if (statusImagem === 'com_imagem') {
      sql += ` AND (p.imagem_url IS NOT NULL AND p.imagem_status = 'CONCLUIDO')`;
    }

    sql += ` GROUP BY p.id_produto ORDER BY p.id_produto DESC LIMIT $${i++} OFFSET $${i++}`;
    params.push(limite, offset);

    return pool.query(sql, params);
  }

  static async atualizarProdutoAdmin(id: string, dados: any) {
    const {
      nome_produto,
      marca,
      categoria,
      peso,
      unidade_medida,
      imagem_url,
      status_enriquecimento
    } = dados;

    const nomeNormalizado = nome_produto ? nome_produto.trim().toUpperCase() : null;
    const statusImagemNovo = imagem_url ? 'CONCLUIDO' : 'PENDENTE';

    return pool.query(
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
  }
}