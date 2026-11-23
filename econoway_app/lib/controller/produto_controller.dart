import '../interfaces/produto_repository.dart';
import '../models/produto_dto.dart';

/// Adaptador de apresentação temporário do alpha.
/// A evolução planejada move este estado para um ViewModel por feature.
class ProdutoController {
  final IProdutoRepository _repository;
  ProdutoController(this._repository);

  Future<List<ProdutoDTO>> buscarProduto(
    String pesquisa, {
    String categoria = '',
  }) => _repository.buscarProduto(pesquisa, categoria: categoria);

  Future<ProdutoDTO> buscarDetalhe(int id) => _repository.buscarDetalhe(id);

  void dispose() {}
}
