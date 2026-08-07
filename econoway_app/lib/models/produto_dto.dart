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
      idProduto: json['id_produto'],
      codigoBarras: json['codigo_barras'],
      nomeProduto: json['nome_produto'],
      marca: json['marca'],
      categoria: json['categoria'],
      preco: double.tryParse(json['preco']?.toString() ?? '0') ?? 0,
      precoMedio: double.tryParse(json['precoMedio']?.toString() ?? '0') ?? 0,
      variacaoPreco:
          double.tryParse(json['variacaoPreco']?.toString() ?? '0') ?? 0,
      peso: double.tryParse(json['peso']?.toString() ?? '0') ?? 0,

      unidadeMedida: json['unidade_medidada'] ?? '',
    );
  }
}

abstract class IProdutoRepository {
  Future<List<ProdutoDTO>> buscarProduto(String pesquisa, {String categoria});
  Future<ProdutoDTO> buscarDetalhe(int id);
}
