import '../core/network/api_client.dart';

class ResumoUsuario {
  final double economiaMes;
  final double economiaTotal;
  final double economiaPotencial;
  final String? mercadoMaisBarato;
  final int totalComparacoes;
  final int econoCoins;
  final int totalNotasValidas;
  final int produtosComPreco;
  final int metaMapa;
  final double progressoMapa;

  ResumoUsuario({
    required this.economiaMes,
    required this.economiaTotal,
    required this.economiaPotencial,
    this.mercadoMaisBarato,
    required this.totalComparacoes,
    required this.econoCoins,
    required this.totalNotasValidas,
    required this.produtosComPreco,
    required this.metaMapa,
    required this.progressoMapa,
  });

  factory ResumoUsuario.fromJson(Map<String, dynamic> json) {
    final mapa = json['mapa'] is Map<String, dynamic>
        ? json['mapa'] as Map<String, dynamic>
        : <String, dynamic>{};

    return ResumoUsuario(
      economiaMes: _asDouble(json['economia_mes']),
      economiaTotal: _asDouble(json['economia_total']),
      economiaPotencial: _asDouble(json['economia_potencial']),
      mercadoMaisBarato: json['mercado_mais_barato']?.toString(),
      totalComparacoes: _asInt(json['total_comparacoes']),
      econoCoins: _asInt(json['econo_coins']),
      totalNotasValidas: _asInt(json['total_notas_validas']),
      produtosComPreco: _asInt(mapa['produtos_com_preco']),
      metaMapa: _asInt(mapa['meta'], fallback: 50),
      progressoMapa: _asDouble(mapa['progresso']),
    );
  }

  bool get semDados => totalComparacoes == 0;

  static double _asDouble(dynamic value) =>
      double.tryParse(value?.toString() ?? '') ?? 0;

  static int _asInt(dynamic value, {int fallback = 0}) =>
      int.tryParse(value?.toString() ?? '') ?? fallback;
}

class EconomiaService {
  static Future<ResumoUsuario> buscarResumo() async {
    final data = await ApiClient.get('/economia/resumo');
    if (data is! Map<String, dynamic>) {
      throw ApiException('Resposta de resumo inválida.');
    }
    return ResumoUsuario.fromJson(data);
  }
}
