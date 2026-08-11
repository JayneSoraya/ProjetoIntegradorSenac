import '../core/network/api_client.dart';
import '../interfaces/produto_repository.dart';
import '../models/produto_dto.dart';

class ProdutoRepository implements IProdutoRepository {
  @override
  Future<List<ProdutoDTO>> buscarProduto(
    String pesquisa, {
    String categoria = '',
  }) async {
    final params = <String, String>{};
    if (pesquisa.trim().isNotEmpty) params['busca'] = pesquisa.trim();
    if (categoria.isNotEmpty && categoria != 'Todos') {
      params['categoria'] = categoria;
    }

    final data = await ApiClient.get('/produtos', queryParameters: params);
    if (data is! List) {
      throw ApiException('Resposta de produtos inválida.');
    }

    return data
        .whereType<Map<String, dynamic>>()
        .map(ProdutoDTO.fromJson)
        .toList();
  }

  @override
  Future<ProdutoDTO> buscarDetalhe(int id) async {
    final data = await ApiClient.get('/produtos/$id');
    if (data is! Map<String, dynamic>) {
      throw ApiException('Resposta de produto inválida.');
    }
    return ProdutoDTO.fromJson(data);
  }
}
