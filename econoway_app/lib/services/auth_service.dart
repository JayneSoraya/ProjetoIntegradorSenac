import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String baseUrl = 'http://192.168.1.11:3333/api/auth';
  static const String _tokenKey = 'jwt_token';
  static const String _nomeKey = 'user_nome';
  static const String _tipoContaKey = 'tipo_conta';

  // 1. MANTER SESSÃO
  static Future<bool> isUserLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    return token != null && token.isNotEmpty;
  }

  // 2. LOGIN

  static Future<Map<String, dynamic>> login(String email, String senha) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email, 'senha': senha}),
          )
          .timeout(const Duration(seconds: 7));

      final data = jsonDecode(response.body);
      print(data);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_tokenKey, data['token']);

        await prefs.setString(_nomeKey, data['usuario']['nome'] ?? 'Usuário');
        await prefs.setString(
          _tipoContaKey,
          data['usuario']['tipo_conta'] ?? 'USER',
        );

        return {'status': 'sucesso', 'usuario': data['usuario']};
      } else {
        return {
          'status': 'erro',
          'mensagem': data['erro'] ?? 'Credenciais inválidas.',
        };
      }
    } catch (e) {
      return {'status': 'erro', 'mensagem': 'Falha na conexão com o servidor.'};
    }
  }

  static Future<String> getTipoConta() async {
    final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_tipoContaKey) ?? 'USER';
  }

  // 3. CADASTRAR
  static Future<Map<String, dynamic>> cadastrar(
    String nome,
    String email,
    String senha,
  ) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/cadastro'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'nome': nome, 'email': email, 'senha': senha}),
          )
          .timeout(const Duration(seconds: 7));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'status': 'sucesso',
          'mensagem': data['mensagem'] ?? 'Conta criada com sucesso!',
        };
      } else {
        return {
          'status': 'erro',
          'mensagem': data['erro'] ?? 'Erro ao criar conta.',
        };
      }
    } catch (e) {
      return {'status': 'erro', 'mensagem': 'Falha na conexão com o servidor.'};
    }
  }

  // 4. RECUPERAR SENHA
  static Future<Map<String, dynamic>> resetPassword(String email) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/recuperar-senha'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email}),
          )
          .timeout(const Duration(seconds: 7));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {
          'status': 'sucesso',
          'mensagem':
              data['mensagem'] ?? 'Instruções enviadas para o seu e-mail.',
        };
      } else {
        return {
          'status': 'erro',
          'mensagem': data['erro'] ?? 'E-mail não encontrado.',
        };
      }
    } catch (e) {
      return {'status': 'erro', 'mensagem': 'Falha na conexão com o servidor.'};
    }
  }

  // 5. LOGOUT
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_nomeKey);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<String> getNome() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_nomeKey) ?? 'Usuário';
  }
}
