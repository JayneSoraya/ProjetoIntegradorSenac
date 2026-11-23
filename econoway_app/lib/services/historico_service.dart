import '../core/network/api_client.dart';
import '../models/historico_compras.dart';
import '../models/historico_preco.dart';
import '../models/progresso_contribuicao.dart';

class HistoricoService {
  static Future<List<CompraResumo>> listarCompras() async {
    final data = await ApiClient.get('/historico/compras');
    if (data is! List) {
      throw ApiException('Resposta de histórico inválida.');
    }
    return data
        .whereType<Map<String, dynamic>>()
        .map(CompraResumo.fromJson)
        .toList();
  }

  static Future<CompraDetalhe> detalharCompra(int idNota) async {
    final data = await ApiClient.get('/historico/compras/$idNota');
    if (data is! Map<String, dynamic>) {
      throw ApiException('Resposta de compra inválida.');
    }
    try {
      return CompraDetalhe.fromJson(data);
    } on FormatException {
      throw ApiException('Resposta de compra inválida.');
    }
  }

  static Future<HistoricoPrecoProduto> precosDoProduto(int idProduto) async {
    final data = await ApiClient.get('/historico/precos/$idProduto');
    if (data is! Map<String, dynamic>) {
      throw ApiException('Resposta de preços inválida.');
    }
    try {
      return HistoricoPrecoProduto.fromJson(data);
    } on FormatException {
      throw ApiException('Resposta de preços inválida.');
    }
  }

  static Future<ProgressoContribuicao> buscarProgresso() async {
    final data = await ApiClient.get('/progresso');
    if (data is! Map<String, dynamic>) {
      throw ApiException('Resposta de progresso inválida.');
    }
    return ProgressoContribuicao.fromJson(data);
  }
}
