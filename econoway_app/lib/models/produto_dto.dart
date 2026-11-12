class ProdutoDTO {
  final int idProduto;
  final String codigoBarras;
  final String nomeProduto;
  final String? marca;
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
      idProduto: json['id_produto'] != null
          ? int.tryParse(json['id_produto'].toString()) ?? 0
          : 0,
      codigoBarras: json['codigo_barras']?.toString() ?? '',
      nomeProduto: json['nome_produto']?.toString() ?? '',
      marca: json['marca']?.toString(),
      categoria: json['categoria']?.toString() ?? '',

      // Tratamento seguro dos campos numéricos
      preco: double.tryParse(json['preco']?.toString() ?? '0') ?? 0.0,

      precoMedio:
          double.tryParse(json['preco_medio']?.toString() ?? '0') ?? 0.0,
      variacaoPreco:
          double.tryParse(json['variacao_preco']?.toString() ?? '0') ?? 0.0,

      peso: double.tryParse(json['peso']?.toString() ?? '0') ?? 0.0,
      unidadeMedida: json['unidade_medida']?.toString() ?? '',
    );
  }
}

abstract class IProdutoRepository {
  Future<List<ProdutoDTO>> buscarProduto(
    String pesquisa, {
    String categoria = '',
    int page = 1,
    int limit = 50,
  });
  Future<ProdutoDTO> buscarDetalhe(int id);
}
