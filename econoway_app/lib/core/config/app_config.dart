class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3333/api',
  );

  static const bool _isProduct = bool.fromEnvironment('dart.vm.product');

  static Uri endpoint(String path) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    final uri = Uri.parse('$apiBaseUrl$normalizedPath');

    if (_isProduct && uri.scheme != 'https') {
      throw StateError('Build de produção exige API_BASE_URL com HTTPS.');
    }

    return uri;
  }
}
