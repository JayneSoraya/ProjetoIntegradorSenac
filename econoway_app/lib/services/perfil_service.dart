import '../core/network/api_client.dart';
import '../models/perfil_usuario.dart';

class PerfilService {
  static Future<PerfilUsuario> buscar() async {
    final data = await ApiClient.get('/usuario/me') as Map<String, dynamic>;
    return PerfilUsuario.fromJson(data);
  }

  static Future<PerfilUsuario> atualizar({
    String? cep,
    String? endereco,
    String? tipoVeiculo,
  }) async {
    final data =
        await ApiClient.put(
              '/usuario/me',
              body: {
                'cep': cep?.trim().isEmpty == true
                    ? null
                    : cep?.replaceAll(RegExp(r'\D'), ''),
                'endereco': endereco?.trim().isEmpty == true
                    ? null
                    : endereco?.trim(),
                'tipo_veiculo': tipoVeiculo?.trim().isEmpty == true
                    ? null
                    : tipoVeiculo?.trim(),
              },
            )
            as Map<String, dynamic>;
    return PerfilUsuario.fromJson(data);
  }

  static Future<Map<String, dynamic>> exportar() async {
    return await ApiClient.get('/usuario/me/exportar') as Map<String, dynamic>;
  }

  static Future<void> excluir(String senha) async {
    await ApiClient.delete('/usuario/me', body: {'senha': senha});
  }
}
