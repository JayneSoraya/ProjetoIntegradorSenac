import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

class MercadoService {
  static Future<Map<String, dynamic>> obterPerfil() async {
    try {
      final token = await AuthService.getToken();

      final response = await http
          .get(
            Uri.parse('${ApiConfig.baseUrl}/mercado/meu-perfil'),
            headers: {'Authorization': 'Bearer $token'},
          )
          .timeout(const Duration(seconds: 7));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {
          'status': 'erro',
          'mensagem':
              'Falha ao obter perfil do mercado(${response.statusCode}).',
        };
      }
    } catch (e) {
      return {'status': 'erro', 'mensagem': 'Falha na conexão com o servidor.'};
    }
  }
}
