double _asDouble(dynamic value) =>
    double.tryParse(value?.toString() ?? '') ?? 0;

int _asInt(dynamic value) => int.tryParse(value?.toString() ?? '') ?? 0;

/// Linha da lista GET /api/historico/compras.
class CompraResumo {
  final int idNota;
  final DateTime? dataCompra;
  final String supermercado;
  final double total;
  final int totalItens;

  const CompraResumo({
    required this.idNota,
    required this.dataCompra,
    required this.supermercado,
    required this.total,
    required this.totalItens,
  });

  factory CompraResumo.fromJson(Map<String, dynamic> json) => CompraResumo(
    idNota: _asInt(json['id_nota']),
    dataCompra: DateTime.tryParse(json['data_compra']?.toString() ?? ''),
    supermercado: json['supermercado']?.toString() ?? 'Supermercado',
    total: _asDouble(json['total']),
    totalItens: _asInt(json['total_itens']),
  );
}

class CompraItem {
  final int? idProduto;
  final String nomeProduto;
  final String? unidade;
  final double quantidade;
  final double precoUnitario;
  final double subtotal;

  const CompraItem({
    required this.idProduto,
    required this.nomeProduto,
    required this.unidade,
    required this.quantidade,
    required this.precoUnitario,
    required this.subtotal,
  });

  factory CompraItem.fromJson(Map<String, dynamic> json) => CompraItem(
    idProduto: int.tryParse(json['id_produto']?.toString() ?? ''),
    nomeProduto: json['nome_produto']?.toString() ?? 'Produto',
    unidade: json['unidade']?.toString(),
    quantidade: _asDouble(json['quantidade']),
    precoUnitario: _asDouble(json['preco_unitario']),
    subtotal: _asDouble(json['subtotal']),
  );
}

/// Resposta de GET /api/historico/compras/:id.
class CompraDetalhe {
  final int idNota;
  final DateTime? dataCompra;
  final String supermercado;
  final String? endereco;
  final double total;
  final int totalItens;
  final List<CompraItem> itens;

  const CompraDetalhe({
    required this.idNota,
    required this.dataCompra,
    required this.supermercado,
    required this.endereco,
    required this.total,
    required this.totalItens,
    required this.itens,
  });

  factory CompraDetalhe.fromJson(Map<String, dynamic> json) {
    final nota = json['nota'];
    final itens = json['itens'];
    if (nota is! Map<String, dynamic> || itens is! List) {
      throw const FormatException('Resposta de compra inválida.');
    }
    return CompraDetalhe(
      idNota: _asInt(nota['id_nota']),
      dataCompra: DateTime.tryParse(nota['data_compra']?.toString() ?? ''),
      supermercado: nota['supermercado']?.toString() ?? 'Supermercado',
      endereco: nota['endereco']?.toString(),
      total: _asDouble(nota['total']),
      totalItens: _asInt(nota['total_itens']),
      itens: itens
          .whereType<Map<String, dynamic>>()
          .map(CompraItem.fromJson)
          .toList(),
    );
  }
}
