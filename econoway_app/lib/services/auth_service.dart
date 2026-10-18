import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  static const _secureStorage = FlutterSecureStorage();
  static const String _tokenKey = 'jwt_token';
  static const String _nomeKey = 'user_nome';
  static const String _tipoContaKey = 'tipo_conta';

  // 1. MANTER SESSÃO
  static Future<bool> isUserLoggedIn() async {
    final token = await _secureStorage.read(key: _tokenKey);
    return token != null && token.isNotEmpty;
  }

  // 2. LOGIN
  static Future<Map<String, dynamic>> login(String email, String senha) async {
    try {
      final response = await http
          .post(
            Uri.parse('${ApiConfig.baseUrl}/login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email, 'senha': senha}),
          )
          .timeout(const Duration(seconds: 7));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        await _secureStorage.write(key: _tokenKey, value: data['token']);
        await _secureStorage.write(
          key: _nomeKey,
          value: data['usuario']['nome'] ?? 'Usuário',
        );
        await _secureStorage.write(
          key: _tipoContaKey,
          value: data['usuario']['tipo_conta'] ?? 'USER',
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
    return await _secureStorage.read(key: _tipoContaKey) ?? 'USER';
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
            Uri.parse('${ApiConfig.baseUrl}/cadastro'),
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
            Uri.parse('${ApiConfig.baseUrl}/recuperar-senha'),
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
    await _secureStorage.delete(key: _tokenKey);
    await _secureStorage.delete(key: _nomeKey);
    await _secureStorage.delete(key: _tipoContaKey);
  }

  static Future<String?> getToken() async {
    return await _secureStorage.read(key: _tokenKey);
  }

  static Future<String> getNome() async {
    return await _secureStorage.read(key: _nomeKey) ?? 'Usuário';
  }
}
