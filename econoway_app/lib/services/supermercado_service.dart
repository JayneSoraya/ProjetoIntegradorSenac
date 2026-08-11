import '../core/network/api_client.dart';
import '../models/supermercado_dto.dart';

class SupermercadoService {
  static Future<List<SupermercadoDTO>> listar({
    double? latitude,
    double? longitude,
  }) async {
    final query = latitude != null && longitude != null
        ? {'lat': latitude.toString(), 'lng': longitude.toString()}
        : null;
    final data = await ApiClient.get('/supermercados', queryParameters: query);
    if (data is! List) {
      throw ApiException('Resposta de supermercados inválida.');
    }
    return data
        .whereType<Map<String, dynamic>>()
        .map(SupermercadoDTO.fromJson)
        .toList();
  }

  static Future<void> favoritar(int id, bool favorito) async {
    if (favorito) {
      await ApiClient.put('/supermercados/$id/favorito');
    } else {
      await ApiClient.delete('/supermercados/$id/favorito');
    }
  }
}
