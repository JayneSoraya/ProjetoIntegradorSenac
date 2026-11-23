double _asDouble(dynamic value) =>
    double.tryParse(value?.toString() ?? '') ?? 0;

class PrecoMercado {
  final int idSupermercado;
  final String supermercado;
  final double precoAtual;
  final double? precoFidelidade;
  final String fonte;
  final DateTime? dataAtualizacao;

  const PrecoMercado({
    required this.idSupermercado,
    required this.supermercado,
    required this.precoAtual,
    required this.precoFidelidade,
    required this.fonte,
    required this.dataAtualizacao,
  });

  factory PrecoMercado.fromJson(Map<String, dynamic> json) => PrecoMercado(
    idSupermercado:
        int.tryParse(json['id_supermercado']?.toString() ?? '') ?? 0,
    supermercado: json['supermercado']?.toString() ?? 'Supermercado',
    precoAtual: _asDouble(json['preco_atual']),
    precoFidelidade: json['preco_fidelidade'] == null
        ? null
        : _asDouble(json['preco_fidelidade']),
    fonte: json['fonte']?.toString() ?? '',
    dataAtualizacao: DateTime.tryParse(
      json['data_atualizacao']?.toString() ?? '',
    ),
  );
}

class CompraDoProduto {
  final int idNota;
  final String supermercado;
  final DateTime? dataCompra;
  final double quantidade;
  final double precoUnitario;

  const CompraDoProduto({
    required this.idNota,
    required this.supermercado,
    required this.dataCompra,
    required this.quantidade,
    required this.precoUnitario,
  });

  factory CompraDoProduto.fromJson(Map<String, dynamic> json) =>
      CompraDoProduto(
        idNota: int.tryParse(json['id_nota']?.toString() ?? '') ?? 0,
        supermercado: json['supermercado']?.toString() ?? 'Supermercado',
        dataCompra: DateTime.tryParse(json['data_compra']?.toString() ?? ''),
        quantidade: _asDouble(json['quantidade']),
        precoUnitario: _asDouble(json['preco_unitario']),
      );
}

/// Resposta de GET /api/historico/precos/:idProduto.
class HistoricoPrecoProduto {
  final String nomeProduto;
  final String? marca;
  final String? categoria;
  final List<PrecoMercado> precosAtuais;
  final List<CompraDoProduto> minhasCompras;

  const HistoricoPrecoProduto({
    required this.nomeProduto,
    required this.marca,
    required this.categoria,
    required this.precosAtuais,
    required this.minhasCompras,
  });

  factory HistoricoPrecoProduto.fromJson(Map<String, dynamic> json) {
    final produto = json['produto'];
    final precos = json['precos_atuais'];
    final compras = json['minhas_compras'];
    if (produto is! Map<String, dynamic> || precos is! List) {
      throw const FormatException('Resposta de preços inválida.');
    }
    return HistoricoPrecoProduto(
      nomeProduto: produto['nome_produto']?.toString() ?? 'Produto',
      marca: produto['marca']?.toString(),
      categoria: produto['categoria']?.toString(),
      precosAtuais: precos
          .whereType<Map<String, dynamic>>()
          .map(PrecoMercado.fromJson)
          .toList(),
      minhasCompras: compras is List
          ? compras
                .whereType<Map<String, dynamic>>()
                .map(CompraDoProduto.fromJson)
                .toList()
          : const [],
    );
  }
}
