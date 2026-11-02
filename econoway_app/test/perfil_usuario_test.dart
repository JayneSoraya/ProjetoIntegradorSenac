import 'package:econoway_app/models/perfil_usuario.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('PerfilUsuario preserva campos opcionais do contrato snake_case', () {
    final perfil = PerfilUsuario.fromJson({
      'id_conta': 10,
      'id_usuario': 20,
      'nome': 'Pessoa Teste',
      'email': 'pessoa@example.test',
      'cep': '01001000',
      'endereco': 'Praça da Sé',
      'tipo_veiculo': 'CARRO',
    });

    expect(perfil.idConta, 10);
    expect(perfil.idUsuario, 20);
    expect(perfil.cep, '01001000');
    expect(perfil.tipoVeiculo, 'CARRO');
  });
}
