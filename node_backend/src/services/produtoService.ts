import { ProdutoRepository } from "../repositories/produtoRepository";

export class ProdutoService {

  static async buscar(termo: string) {
    return await ProdutoRepository.buscar(termo);
  }

  static async buscarDetalhe(id: number) {
    return await ProdutoRepository.buscarDetalhe(id);
  }
}