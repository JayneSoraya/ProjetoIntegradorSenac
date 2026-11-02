import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Gerencia o armazenamento seguro e criptografado da sessão do usuário.
class SecureSessionStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const String _tokenKey = 'jwt_token';
  static const String _nameKey = 'user_nome';
  static const String _roleKey = 'tipo_conta';

  /// Salva todos os dados da sessão de uma só vez após o login bem-sucedido.
  static Future<void> saveSession({
    required String token,
    required String name,
    String? role,
  }) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _nameKey, value: name);
    if (role != null) {
      await _storage.write(key: _roleKey, value: role);
    }
  }

  /// Lê o token JWT armazenado.
  static Future<String?> readToken() async {
    return await _storage.read(key: _tokenKey);
  }

  /// Lê o nome do usuário armazenado.
  static Future<String?> readName() async {
    return await _storage.read(key: _nameKey);
  }

  /// Lê o tipo de conta (role) armazenado.
  static Future<String?> readRole() async {
    return await _storage.read(key: _roleKey);
  }

  /// Limpa completamente todos os dados da sessão (Logout).
  static Future<void> clear() async {
    await _storage.deleteAll();
  }
}
