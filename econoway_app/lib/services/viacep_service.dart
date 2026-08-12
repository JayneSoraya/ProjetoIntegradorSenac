import 'dart:convert';
import 'package:http/http.dart' as http;

class ViaCepService {
  static Future<Map<String, dynamic>?> buscarCep(
      String cep) async {

    cep = cep.replaceAll('-', '');

    final response = await http.get(
      Uri.parse(
        'https://viacep.com.br/ws/$cep/json/',
      ),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }

    return null;
  }
}