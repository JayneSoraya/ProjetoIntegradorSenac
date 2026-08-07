import 'dart:convert';

import 'package:http/http.dart' as http;

import '../controller/carrinho_controller.dart';
import '../services/auth_service.dart';

class ComparacaoController {
  final String baseUrl = 'http://192.168.1.11:3333/api';

  Future<List<dynamic>> comparar() async {
    try {
      final carrinho = CarrinhoController();

      if (carrinho.itens.isEmpty) {
        throw Exception('Carrinho vazio. Adicione produtos antes de comparar.');
      }

      final token = await AuthService.getToken();

      final response = await http.post(
        Uri.parse('$baseUrl/comparacao'),
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
