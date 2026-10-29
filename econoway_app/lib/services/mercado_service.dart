import 'dart:convert';
import 'package:http/http.dart' as http;

import 'auth_service.dart';

class MercadoService {
  static Future<Map<String, dynamic>> obterPerfil() async {
    final token = await AuthService.getToken();

    final response = await http.get(
      Uri.parse('http://localhost:3333/mercado/meu-perfil'),
      headers: {'Authorization': 'Bearer $token'},
    );

    return jsonDecode(response.body);
  }
}
