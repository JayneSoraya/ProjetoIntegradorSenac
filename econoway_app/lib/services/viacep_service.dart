import 'dart:convert';
import 'package:http/http.dart' as http;

class ViaCepService {
  static Future<Map<String, dynamic>?> buscarCep(String cep) async {
    cep = cep.replaceAll(RegExp(r'[^0-9]'), '');

    if (cep.length != 8) {
      return null;
    }

    final response = await http
        .get(Uri.parse('https://viacep.com.br/ws/$cep/json/'))
        .timeout(const Duration(seconds: 5));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data.containsKey('erro') && data['erro'] == true) {
        return null;
      }
      return data;
    }
    

    return null;
  }
}
