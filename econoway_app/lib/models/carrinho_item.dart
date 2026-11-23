class CarrinhoItem {
  final int idProduto;
  final String nomeProduto;
  final double preco;
  final int quantidade;

  const CarrinhoItem({
    required this.idProduto,
    required this.nomeProduto,
    required this.preco,
    this.quantidade = 1,
  });

  double get total => preco * quantidade;

  CarrinhoItem copyWith({int? quantidade}) => CarrinhoItem(
    idProduto: idProduto,
    nomeProduto: nomeProduto,
    preco: preco,
    quantidade: quantidade ?? this.quantidade,
  );
}
