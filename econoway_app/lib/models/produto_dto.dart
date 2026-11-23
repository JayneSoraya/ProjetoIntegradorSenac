class ProdutoDTO {
  final int idProduto;
  final String codigoBarras;
  final String nomeProduto;
  final String marca;
  final String categoria;
  final double preco;
  final double peso;
  final double variacaoPreco;
  final double precoMedio;
  final String unidadeMedida;

  ProdutoDTO({
    required this.idProduto,
    required this.codigoBarras,
    required this.nomeProduto,
    required this.marca,
    required this.categoria,
    required this.preco,
    required this.peso,
    required this.variacaoPreco,
    required this.precoMedio,
    required this.unidadeMedida,
  });

  factory ProdutoDTO.fromJson(Map<String, dynamic> json) {
    return ProdutoDTO(
      idProduto: int.tryParse(json['id_produto']?.toString() ?? '') ?? 0,
      codigoBarras: json['codigo_barras']?.toString() ?? '',
      nomeProduto: json['nome_produto']?.toString() ?? '',
      marca: json['marca']?.toString() ?? '',
      categoria: json['categoria']?.toString() ?? '',
      preco: _asDouble(json['preco']),
      precoMedio: _asDouble(json['preco_medio']),
      variacaoPreco: _asDouble(json['variacao_preco']),
      peso: _asDouble(json['peso']),
      unidadeMedida: json['unidade_medida']?.toString() ?? '',
    );
  }

  static double _asDouble(dynamic value) =>
      double.tryParse(value?.toString() ?? '') ?? 0;
}
