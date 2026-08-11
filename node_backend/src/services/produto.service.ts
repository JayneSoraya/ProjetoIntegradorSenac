import { ProdutoRepository } from '../repositories/produto.repository';

export class ProdutoService {
  static async buscar(termo: string, categoria = '') {
    return ProdutoRepository.buscar(termo.trim(), categoria.trim());
  }

  static async buscarDetalhe(id: number) {
    return ProdutoRepository.buscarDetalhe(id);
  }
}
