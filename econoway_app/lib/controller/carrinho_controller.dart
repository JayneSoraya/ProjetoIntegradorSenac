import '../models/carrinho_item.dart';

class CarrinhoController {
  static final CarrinhoController _instance = CarrinhoController._internal();

  factory CarrinhoController() => _instance;

  CarrinhoController._internal();

  final List<CarrinhoItem> _itens = [];

  List<CarrinhoItem> get itens => _itens;


  void adicionar(CarrinhoItem item) {
    final index = _itens.indexWhere((i) => i.idProduto == item.idProduto);

    if (index != -1) {
      _itens[index].quantidade++;
    } else {
      _itens.add(item);
    }
  }

  //  REMOVER  RF09
  void remover(int idProduto) {
    _itens.removeWhere((i) => i.idProduto == idProduto);
  }

  //  TOTAL  RF10
  double get total {
    return _itens.fold(0, (soma, item) => soma + item.total);
  }

  int get quantidadeTotal {
    return _itens.fold(0, (total, item) => total + item.quantidade);
  }
}
