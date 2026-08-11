import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../storage/secure_session_storage.dart';

class ApiException implements Exception {
  final int? statusCode;
  final String message;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class ApiClient {
  static const Duration defaultTimeout = Duration(seconds: 10);

  static Future<Map<String, String>> _headers({
    bool authenticated = true,
  }) async {
    final headers = <String, String>{'Content-Type': 'application/json'};

    if (authenticated) {
      final token = await SecureSessionStorage.readToken();
      if (token == null || token.isEmpty) {
        throw ApiException('Sessão não encontrada.', statusCode: 401);
      }
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  static Future<dynamic> get(
    String path, {
    Map<String, String>? queryParameters,
    bool authenticated = true,
    Duration timeout = defaultTimeout,
  }) async {
    final base = AppConfig.endpoint(path);
    final uri = queryParameters == null
        ? base
        : base.replace(queryParameters: queryParameters);

    final response = await http
        .get(uri, headers: await _headers(authenticated: authenticated))
        .timeout(timeout);

    return _decode(response);
  }

  static Future<dynamic> post(
    String path, {
    Object? body,
    bool authenticated = true,
    Duration timeout = defaultTimeout,
  }) async {
    final response = await http
        .post(
          AppConfig.endpoint(path),
          headers: await _headers(authenticated: authenticated),
          body: body == null ? null : jsonEncode(body),
        )
        .timeout(timeout);

    return _decode(response);
  }

  static Future<dynamic> put(
    String path, {
    Object? body,
    bool authenticated = true,
    Duration timeout = defaultTimeout,
  }) async {
    final response = await http
        .put(
          AppConfig.endpoint(path),
          headers: await _headers(authenticated: authenticated),
          body: body == null ? null : jsonEncode(body),
        )
        .timeout(timeout);
    return _decode(response);
  }

  static Future<dynamic> delete(
    String path, {
    Object? body,
    bool authenticated = true,
    Duration timeout = defaultTimeout,
  }) async {
    final response = await http
        .delete(
          AppConfig.endpoint(path),
          headers: await _headers(authenticated: authenticated),
          body: body == null ? null : jsonEncode(body),
        )
        .timeout(timeout);
    return _decode(response);
  }

  static dynamic _decode(http.Response response) {
    dynamic payload;
    if (response.body.isNotEmpty) {
      try {
        payload = jsonDecode(response.body);
      } catch (_) {
        payload = null;
      }
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return payload;
    }

    if (response.statusCode == 401) {
      unawaited(SecureSessionStorage.clear());
    }

    final serverMessage = payload is Map<String, dynamic>
        ? payload['erro'] ?? payload['mensagem']
        : null;

    throw ApiException(
      serverMessage?.toString() ?? 'Falha na comunicação com o servidor.',
      statusCode: response.statusCode,
    );
  }
}
