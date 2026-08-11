import 'dart:convert';

import '../core/network/api_client.dart';
import '../core/storage/secure_session_storage.dart';

class AuthService {
  static Future<bool> isUserLoggedIn() async {
    final token = await SecureSessionStorage.readToken();
    if (token == null || token.isEmpty) return false;

    if (_isJwtExpired(token)) {
      await logout();
      return false;
    }

    return true;
  }

  static Future<Map<String, dynamic>> login(String email, String senha) async {
    try {
      final data =
          await ApiClient.post(
                '/auth/login',
                authenticated: false,
                body: {'email': email.trim(), 'senha': senha},
              )
              as Map<String, dynamic>?;

      final token = data?['token']?.toString();
      final usuario = data?['usuario'];
      if (token == null || usuario is! Map<String, dynamic>) {
        return {'status': 'erro', 'mensagem': 'Resposta de login inválida.'};
      }

      await SecureSessionStorage.saveSession(
        token: token,
        name: usuario['nome']?.toString() ?? 'Usuário',
        role: usuario['tipo_conta']?.toString(),
      );

      return {'status': 'sucesso', 'usuario': usuario};
    } on ApiException catch (e) {
      return {'status': 'erro', 'mensagem': e.message};
    } catch (_) {
      return {'status': 'erro', 'mensagem': 'Falha na conexão com o servidor.'};
    }
  }

  static Future<Map<String, dynamic>> cadastrar(
    String nome,
    String email,
    String senha,
  ) async {
    try {
      final data =
          await ApiClient.post(
                '/auth/cadastro',
                authenticated: false,
                body: {
                  'nome': nome.trim(),
                  'email': email.trim(),
                  'senha': senha,
                },
              )
              as Map<String, dynamic>?;

      return {
        'status': 'sucesso',
        'mensagem':
            data?['mensagem']?.toString() ?? 'Conta criada com sucesso!',
      };
    } on ApiException catch (e) {
      return {'status': 'erro', 'mensagem': e.message};
    } catch (_) {
      return {'status': 'erro', 'mensagem': 'Falha na conexão com o servidor.'};
    }
  }

  static Future<Map<String, dynamic>> resetPassword(String email) async {
    try {
      final data =
          await ApiClient.post(
                '/auth/recuperar-senha',
                authenticated: false,
                body: {'email': email.trim()},
              )
              as Map<String, dynamic>?;

      return {
        'status': 'sucesso',
        'mensagem': data?['mensagem']?.toString() ?? 'Solicitação registrada.',
      };
    } on ApiException catch (e) {
      return {'status': 'erro', 'mensagem': e.message};
    } catch (_) {
      return {'status': 'erro', 'mensagem': 'Falha na conexão com o servidor.'};
    }
  }

  static Future<void> logout() => SecureSessionStorage.clear();
  static Future<String?> getToken() => SecureSessionStorage.readToken();
  static Future<String> getNome() async =>
      await SecureSessionStorage.readName() ?? 'Usuário';
  static Future<String?> getRole() => SecureSessionStorage.readRole();

  static bool _isJwtExpired(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return true;
      final payload = jsonDecode(
        utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
      );
      if (payload is! Map<String, dynamic>) return true;
      final exp = payload['exp'];
      if (exp is! num) return true;
      final expiresAt = DateTime.fromMillisecondsSinceEpoch(exp.toInt() * 1000);
      return DateTime.now().isAfter(expiresAt);
    } catch (_) {
      return true;
    }
  }
}
