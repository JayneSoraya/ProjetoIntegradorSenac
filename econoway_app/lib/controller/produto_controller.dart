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

  Future<List<ProdutoDTO>> buscarProduto(
    String pesquisa, {
    String categoria = '',
  }) async {
    try {
      produtos = await _repository.buscarProduto(
        pesquisa,
        categoria: categoria,
      );
      return produtos;
    } catch (e) {
      erro = 'Erro ao buscar produtos';
      produtos = [];
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
      buscar(texto: texto, categoria: categoria, atualizar: atualizar);
    });
  }

  Future<void> buscar({
    String texto = '',
    String categoria = '',
    required void Function() atualizar,
  }) async {
    carregando = true;
    erro = '';
    atualizar();

    try {
      produtos = await _repository.buscarProduto(texto, categoria: categoria);
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
