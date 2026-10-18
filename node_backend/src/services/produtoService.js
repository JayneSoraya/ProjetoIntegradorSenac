import { ProdutoRepository } from "../repositories/produtoRepository";
import { pool } from '../database';
export class ProdutoService {
    static async buscar(termo) {
        return await ProdutoRepository.buscar(termo);
    }
    static async buscarDetalhe(id) {
        return await ProdutoRepository.buscarDetalhe(id);
    }
    static async corrigirCategoria(idProduto, novaCategoria) {
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
