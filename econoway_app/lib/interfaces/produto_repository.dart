import '../models/produto_dto.dart';

abstract class IProdutoRepository {
  Future<List<ProdutoDTO>> buscarProduto(String pesquisa, {String categoria});

  Future<ProdutoDTO> buscarDetalhe(int id);
}
