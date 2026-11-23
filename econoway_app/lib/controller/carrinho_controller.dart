import 'package:flutter/foundation.dart';
import '../models/carrinho_item.dart';

/// Estado transitório do carrinho durante o alpha.
/// O backend já possui contrato para persistência; a sincronização automática
/// será ativada depois da reconciliação do schema Neon.
class CarrinhoController extends ChangeNotifier {
  CarrinhoController();

  final List<CarrinhoItem> _itens = [];
  List<CarrinhoItem> get itens => List.unmodifiable(_itens);

  void adicionar(CarrinhoItem item) {
    final index = _itens.indexWhere(
      (current) => current.idProduto == item.idProduto,
    );
    if (index >= 0) {
      _itens[index] = _itens[index].copyWith(
        quantidade: _itens[index].quantidade + 1,
      );
    } else {
      _itens.add(item);
    }
    notifyListeners();
  }

  void incrementar(int idProduto) {
    final index = _itens.indexWhere((item) => item.idProduto == idProduto);
    if (index < 0) return;
    _itens[index] = _itens[index].copyWith(
      quantidade: _itens[index].quantidade + 1,
    );
    notifyListeners();
  }

  void decrementar(int idProduto) {
    final index = _itens.indexWhere((item) => item.idProduto == idProduto);
    if (index < 0) return;
    final current = _itens[index];
    if (current.quantidade <= 1) {
      _itens.removeAt(index);
    } else {
      _itens[index] = current.copyWith(quantidade: current.quantidade - 1);
    }
    notifyListeners();
  }

  void remover(int idProduto) {
    _itens.removeWhere((item) => item.idProduto == idProduto);
    notifyListeners();
  }

  double get total => _itens.fold(0, (sum, item) => sum + item.total);
  double get subtotalEstimado => total;
  int get quantidadeTotal =>
      _itens.fold(0, (sum, item) => sum + item.quantidade);

  void restaurar(Iterable<CarrinhoItem> itens) {
    _itens
      ..clear()
      ..addAll(
        itens.where((item) => item.idProduto > 0 && item.quantidade > 0),
      );
    notifyListeners();
  }

  void limpar() {
    if (_itens.isEmpty) return;
    _itens.clear();
    notifyListeners();
  }
}
