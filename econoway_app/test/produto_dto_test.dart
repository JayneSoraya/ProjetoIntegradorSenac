import 'package:flutter_test/flutter_test.dart';
import 'package:econoway_app/models/produto_dto.dart';

void main() {
  test('ProdutoDTO respeita contrato snake_case da API', () {
    final produto = ProdutoDTO.fromJson({
      'id_produto': 7,
      'codigo_barras': '789000000001',
      'nome_produto': 'Arroz',
      'marca': 'Marca',
      'categoria': 'Alimentos',
      'preco': '24.90',
      'preco_medio': '26.10',
      'variacao_preco': '4.20',
      'peso': '5',
      'unidade_medida': 'kg',
    });

    expect(produto.idProduto, 7);
    expect(produto.precoMedio, 26.10);
    expect(produto.variacaoPreco, 4.20);
    expect(produto.unidadeMedida, 'kg');
  });
}
