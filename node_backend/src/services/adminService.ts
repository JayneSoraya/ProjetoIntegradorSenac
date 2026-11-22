import { AdminRepository } from '../repositories/adminRepository';
import { pool } from '../database';
import { obterPlaceholderPorCategoria } from '../utils/imagemUtils';

export class AdminService {
  static async listarMercados() {
    const resultado = await AdminRepository.listarMercados();
    return resultado.rows;
  }

  static async cadastrarMercado(dados: { cnpj: string; nome_fantasia: string; endereco_completo: string }) {
    const { cnpj, nome_fantasia, endereco_completo } = dados;
    if (!cnpj || !nome_fantasia || !endereco_completo) {
      throw new Error('CNPJ, nome e endereço são obrigatórios.');
    }
    const resultado = await AdminRepository.cadastrarMercado(cnpj, nome_fantasia, endereco_completo);
    return resultado.rows[0];
  }

  static async editarMercado(id: string, dados: { nome_fantasia: string; endereco_completo: string; esta_aberto: boolean }) {
    const { nome_fantasia, endereco_completo, esta_aberto } = dados;
    const resultado = await AdminRepository.editarMercado(id, nome_fantasia, endereco_completo, esta_aberto);
    if (resultado.rows.length === 0) {
      throw new Error('Mercado não encontrado.');
    }
    return resultado.rows[0];
  }

  static async removerMercado(id: string) {
    await AdminRepository.removerMercado(id);
    return { mensagem: 'Mercado removido.' };
  }

 static async listarUsuarios(buscaParam?: unknown) {
    const busca = typeof buscaParam === 'string' ? buscaParam : undefined;

    const resultado = await AdminRepository.listarUsuarios(busca);
    return resultado.rows;
  }

  static async bloquearUsuario(id: string, bloquear: boolean) {
    const novoStatus = !bloquear;
    await AdminRepository.bloquearUsuario(id, novoStatus);
    return {
      mensagem: bloquear ? 'Usuário bloqueado.' : 'Usuário desbloqueado.',
    };
  }

  static async listarProdutosAdmin(query: any) {
    const { busca, categoria, status_enriquecimento, status_imagem, pagina = 1, limite = 20 } = query;
    const offset = (Number(pagina) - 1) * Number(limite);

    const [contadoresQuery, produtosQuery] = await Promise.all([
      AdminRepository.obterContadoresProdutos ? AdminRepository.obterContadoresProdutos() : AdminRepository.obterContadoresProdutos(),
      AdminRepository.listarProdutosAdmin(busca, categoria, status_enriquecimento, status_imagem, Number(limite), offset)
    ]);

    const produtosFormatados = produtosQuery.rows.map((prod) => ({
      ...prod,
      imagem_exibicao: prod.imagem_url || obterPlaceholderPorCategoria(prod.categoria),
    }));

    return {
      contadores: contadoresQuery.rows[0],
      produtos: produtosFormatados,
    };
  }

  static async atualizarProdutoAdmin(id: string, dados: any) {
    await AdminRepository.atualizarProdutoAdmin(id, dados);
    return { mensagem: 'Produto atualizado com sucesso!' };
  }

  static async removerProdutoAdmin(id: string) {
  const resultado = await pool.query(
    'DELETE FROM produtos WHERE id_produto = $1 RETURNING id_produto, nome',
    [id]
  );

  if (resultado.rowCount === 0) {
    throw new Error('Produto não encontrado.');
  }

  return resultado.rows[0];
}
}


