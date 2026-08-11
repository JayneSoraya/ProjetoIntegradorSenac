import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureSessionStorage {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'econoway.jwt';
  static const _nameKey = 'econoway.user.name';
  static const _roleKey = 'econoway.user.role';

  static Future<void> saveSession({
    required String token,
    required String name,
    String? role,
  }) async {
    await Future.wait([
      _storage.write(key: _tokenKey, value: token),
      _storage.write(key: _nameKey, value: name),
      if (role != null) _storage.write(key: _roleKey, value: role),
    ]);
  }

  static Future<String?> readToken() => _storage.read(key: _tokenKey);
  static Future<String?> readName() => _storage.read(key: _nameKey);
  static Future<String?> readRole() => _storage.read(key: _roleKey);

  static Future<void> clear() async {
    await Future.wait([
      _storage.delete(key: _tokenKey),
      _storage.delete(key: _nameKey),
      _storage.delete(key: _roleKey),
    ]);
  }
}
