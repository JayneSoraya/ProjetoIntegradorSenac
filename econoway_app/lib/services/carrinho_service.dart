import '../core/network/api_client.dart';
import '../models/carrinho_item.dart';

class CarrinhoService {
  static Future<void> salvar(List<CarrinhoItem> itens) async {
    await ApiClient.put(
      '/carrinho',
      body: {
        'itens': itens
            .map(
              (item) => {
                'idProduto': item.idProduto,
                'quantidade': item.quantidade,
              },
            )
            .toList(),
      },
    );
  }

  static Future<List<CarrinhoItem>> carregar() async {
    final data = await ApiClient.get('/carrinho');
    if (data is! Map<String, dynamic>) return const [];
    final raw = data['itens'];
    if (raw is! List) return const [];

    return raw
        .whereType<Map>()
        .map((value) {
          final item = Map<String, dynamic>.from(value);
          return CarrinhoItem(
            idProduto: int.tryParse(item['id_produto']?.toString() ?? '') ?? 0,
            nomeProduto: item['nome_produto']?.toString() ?? 'Produto',
            preco:
                double.tryParse(item['preco_unitario']?.toString() ?? '') ?? 0,
            quantidade: int.tryParse(item['quantidade']?.toString() ?? '') ?? 1,
          );
        })
        .where((item) => item.idProduto > 0)
        .toList();
  }

  static Future<void> limpar() async {
    await ApiClient.delete('/carrinho');
  }
}
