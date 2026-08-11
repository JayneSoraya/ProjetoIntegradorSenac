import '../core/network/api_client.dart';
import '../models/mercado_comparacao_dto.dart';
import 'carrinho_controller.dart';

class ComparacaoController {
  final CarrinhoController? cart;

  ComparacaoController([this.cart]);

  Future<ComparacaoResultadoDTO> comparar({
    List<int>? supermercados,
    bool salvar = false,
  }) async {
    final currentCart = cart;
    if (currentCart == null || currentCart.itens.isEmpty) {
      throw ApiException(
        'Carrinho vazio. Adicione produtos antes de comparar.',
      );
    }

    final payload = <String, dynamic>{
      'itens': currentCart.itens
          .map(
            (item) => {
              'idProduto': item.idProduto,
              'quantidade': item.quantidade,
            },
          )
          .toList(),
      if (supermercados != null && supermercados.isNotEmpty)
        'supermercados': supermercados,
      'salvar': salvar,
      'estrategia': supermercados != null && supermercados.isNotEmpty
          ? 'SELECIONADOS'
          : 'MENOR_TOTAL',
    };

    final data = await ApiClient.post('/comparacao', body: payload);
    if (data is! Map<String, dynamic>) {
      throw ApiException('Resposta de comparação inválida.');
    }
    try {
      return ComparacaoResultadoDTO.fromJson(data);
    } on FormatException {
      throw ApiException('Resposta de comparação inválida.');
    }
  }

  Future<List<Map<String, dynamic>>> historico() async {
    final data = await ApiClient.get('/comparacao/historico');
    if (data is! List) throw ApiException('Resposta de histórico inválida.');
    return data.whereType<Map<String, dynamic>>().toList();
  }
}
