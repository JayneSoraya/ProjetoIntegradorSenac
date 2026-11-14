import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/config/app_config.dart';
import '../interfaces/produto_repository.dart';
import '../models/produto_dto.dart' hide IProdutoRepository;
import '../services/auth_service.dart';

class ProdutoRepository implements IProdutoRepository {
  Future<Map<String, String>> get _headers async {
    final token = await AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  // RF05 — Busca de produtos por nome/marca/categoria/codigo de barras
  @override
  Future<List<ProdutoDTO>> buscarProduto(
    String pesquisa, {
    String categoria = '',
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final params = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };

      final pesquisaTrimmed = pesquisa.trim();
      if (pesquisaTrimmed.isNotEmpty) {
        params['busca'] = pesquisaTrimmed;
      }

      if (categoria.isNotEmpty && categoria != 'Todos') {
        params['categoria'] = categoria;
      }

      final uri = AppConfig.endpoint(
        'produtos',
      ).replace(queryParameters: params);

      final response = await http.get(uri, headers: await _headers);

      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((json) => ProdutoDTO.fromJson(json)).toList();
      } else {
        throw Exception(
          'Erro ao buscar produtos (Código ${response.statusCode})',
        );
      }
    } catch (e) {
      // Se já for uma Exception tratada, repassa; senão, encapsula como erro de rede/conexão
      if (e is Exception) rethrow;
      throw Exception('Erro na conexão com o servidor: $e');
    }
  }

  // RF07 — Detalhe do produto
  @override
  Future<ProdutoDTO> buscarDetalhe(int id) async {
    try {
      final uri = AppConfig.endpoint('produtos/$id');
      final response = await http.get(uri, headers: await _headers);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return ProdutoDTO.fromJson(data);
      } else if (response.statusCode == 404) {
        throw Exception('Produto não encontrado.');
      } else {
        throw Exception(
          'Erro ao buscar detalhe (Código ${response.statusCode})',
        );
      }
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Erro na conexão com o servidor: $e');
    }
  }
}
