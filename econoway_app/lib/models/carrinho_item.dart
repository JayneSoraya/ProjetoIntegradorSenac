class CarrinhoItem {
  final int idProduto;
  final String nomeProduto;
  final double preco;
  int quantidade;

  CarrinhoItem({
    required this.idProduto,
    required this.nomeProduto,
    required this.preco,
    this.quantidade = 1,
  });

  double get total => preco * quantidade;
}
