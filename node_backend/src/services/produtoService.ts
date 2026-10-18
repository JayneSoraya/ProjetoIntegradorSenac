import { ProdutoRepository } from "../repositories/produtoRepository";
import { pool } from '../database';

export class ProdutoService {

  static async buscar(termo: string) {
    return await ProdutoRepository.buscar(termo);
  }

  static async buscarDetalhe(id: number) {
    return await ProdutoRepository.buscarDetalhe(id);
  }

  static async corrigirCategoria(idProduto: number, novaCategoria: string) {
    const query = `
      UPDATE produto 
      SET categoria = $1 
      WHERE id_produto = $2 
      RETURNING *;
    `;
    const resultado = await pool.query(query, [novaCategoria, idProduto]);
    return resultado.rows[0];
  }
}