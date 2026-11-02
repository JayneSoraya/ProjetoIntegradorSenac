import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/usuario_model.dart';
import '../core/config/app_config.dart';

class AuthController {
  static Future<Map<String, dynamic>> cadastrar(UsuarioModel usuario) async {
    final url = AppConfig.endpoint('/auth/cadastro');

    try {
      final resposta = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(usuario.toJson()),
      );

      final corpo = jsonDecode(resposta.body);

      if (resposta.statusCode == 201) {
        return {'sucesso': true, 'dados': corpo};
      }
      return {'sucesso': false, 'erro': corpo['erro'] ?? 'Erro desconhecido'};
    } catch (e) {
      return {
        'sucesso': false,
        'erro': 'Não foi possível conectar ao servidor.',
      };
    }
  }
}
