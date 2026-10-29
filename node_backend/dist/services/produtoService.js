"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoService = void 0;
const produtoRepository_1 = require("../repositories/produtoRepository");
const database_1 = require("../database");
class ProdutoService {
    static async buscar(termo) {
        return await produtoRepository_1.ProdutoRepository.buscar(termo);
    }
    static async buscarDetalhe(id) {
        return await produtoRepository_1.ProdutoRepository.buscarDetalhe(id);
    }
    static async corrigirCategoria(idProduto, novaCategoria) {
        const query = `
      UPDATE produto 
      SET categoria = $1 
      WHERE id_produto = $2 
      RETURNING *;
    `;
        const resultado = await database_1.pool.query(query, [novaCategoria, idProduto]);
        return resultado.rows[0];
    }
}
exports.ProdutoService = ProdutoService;
