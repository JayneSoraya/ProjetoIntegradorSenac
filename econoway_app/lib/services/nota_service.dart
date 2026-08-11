import '../core/network/api_client.dart';

class NotaService {
  static Future<Map<String, dynamic>> processar(String urlQrCode) async {
    final data = await ApiClient.post(
      '/notas/processar',
      body: {'url_qrcode': urlQrCode},
      timeout: const Duration(seconds: 20),
    );

    if (data is! Map<String, dynamic>) {
      throw ApiException('Resposta de processamento da nota inválida.');
    }
    return data;
  }
}
