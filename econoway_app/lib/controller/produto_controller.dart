import 'dart:async';
import '../models/produto_dto.dart';
import '../repository/produto_repository.dart';

class ProdutoController {
  final ProdutoRepository _repository;
  ProdutoController(this._repository);

  List<ProdutoDTO> produtos = [];
  bool carregando = false;
  String erro = '';

  Timer? _debounce;

  // Atualizado para aceitar page e limit
  Future<List<ProdutoDTO>> buscarProduto(
    String pesquisa, {
    String categoria = '',
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final resultado = await _repository.buscarProduto(
        pesquisa,
        categoria: categoria,
        page: page,
        limit: limit,
      );
      return resultado;
    } catch (e) {
      erro = 'Erro ao buscar produtos';
      return [];
    }
  }

  void onBuscaAlterada(
    String texto,
    String categoria,
    void Function() atualizar,
  ) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      buscar(texto: texto, categoria: categoria, atualizar: atualizar, page: 1);
    });
  }

  Future<void> buscar({
    String texto = '',
    String categoria = '',
    int page = 1,
    int limit = 50,
    required void Function() atualizar,
  }) async {
    carregando = true;
    erro = '';
    atualizar();

    try {
      produtos = await _repository.buscarProduto(
        texto,
        categoria: categoria,
        page: page,
        limit: limit,
      );
    } catch (e) {
      erro = 'Erro ao buscar produtos';
      produtos = [];
    }

    carregando = false;
    atualizar();
  }

  List<ProdutoDTO> filtrar(String categoria) {
    if (categoria == 'Todos') return produtos;
    return produtos.where((p) => p.categoria == categoria).toList();
  }

  void dispose() {
    _debounce?.cancel();
  }
}
