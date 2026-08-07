import { ProdutoRepository } from "../repositories/produto.repository";

export class ProdutoService {

  static async buscar(termo: string) {
    return await ProdutoRepository.buscar(termo);
  }

  static async buscarDetalhe(id: number) {
    return await ProdutoRepository.buscarDetalhe(id);
  }
}