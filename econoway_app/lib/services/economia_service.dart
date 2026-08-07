import 'dart:convert';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';

class ResumoUsuario {
  final double economiaMes;
  final double economiaTotal;
  final double economiaPotencial;
  final String? mercadoMaisBarato;
  final int totalComparacoes;
  final int econoCoins;
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
    required this.produtosComPreco,
    required this.metaMapa,
    required this.progressoMapa,
  });

  factory ResumoUsuario.fromJson(Map<String, dynamic> json) {
    return ResumoUsuario(
      economiaMes: (json['economia_mes'] ?? 0).toDouble(),
      economiaTotal: (json['economia_total'] ?? 0).toDouble(),
      economiaPotencial: (json['economia_potencial'] ?? 0).toDouble(),
      mercadoMaisBarato: json['mercado_mais_barato'],
      totalComparacoes: json['total_comparacoes'] ?? 0,
      econoCoins: json['econo_coins'] ?? 50,
      produtosComPreco: json['mapa']['produtos_com_preco'] ?? 0,
      metaMapa: json['mapa']['meta'] ?? 50,
      progressoMapa: (json['mapa']['progresso'] ?? 0).toDouble(),
    );
  }

  // Sem histórico ainda
  bool get semDados => totalComparacoes == 0;
}

class EconomiaService {
  static const String _baseUrl = 'http://192.168.1.11:3333/api/economia';

  static Future<ResumoUsuario> buscarResumo() async {
    final token = await AuthService.getToken();

    final response = await http
        .get(
          Uri.parse('$_baseUrl/resumo'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        )
        .timeout(const Duration(seconds: 7));

    if (response.statusCode == 200) {
      return ResumoUsuario.fromJson(jsonDecode(response.body));
    }

    throw Exception('Erro ao buscar resumo.');
  }
}
