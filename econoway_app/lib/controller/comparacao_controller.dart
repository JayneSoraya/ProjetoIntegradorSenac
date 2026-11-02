import 'dart:convert';
import 'package:http/http.dart' as http;
import '../controller/carrinho_controller.dart';
import '../services/auth_service.dart';
import '../core/config/app_config.dart';

class ComparacaoController {
  Future<List<dynamic>> comparar() async {
    final url = AppConfig.endpoint('/comparacao');
    try {
      final carrinho = CarrinhoController();

      if (carrinho.itens.isEmpty) {
        throw Exception('Carrinho vazio. Adicione produtos antes de comparar.');
      }

      final token = await AuthService.getToken();

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'itens': carrinho.itens
              .map(
                (item) => {
                  'idProduto': item.idProduto,
                  'quantidade': item.quantidade,
                },
              )
              .toList(),
        }),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);

        return data;
      }

      if (response.statusCode == 400) {
        final erro = jsonDecode(response.body);

        throw Exception(erro['erro'] ?? 'Carrinho inválido.');
      }

      throw Exception('Erro ao comparar mercados.');
    } catch (e) {
      rethrow;
    }
  }
}
