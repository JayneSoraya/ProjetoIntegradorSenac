import 'package:flutter_test/flutter_test.dart';
import 'package:econoway_app/controller/carrinho_controller.dart';
import 'package:econoway_app/models/carrinho_item.dart';

void main() {
  late CarrinhoController cart;

  setUp(() => cart = CarrinhoController());

  test('inicia vazio e expõe subtotal estimado', () {
    expect(cart.itens, isEmpty);
    expect(cart.quantidadeTotal, 0);
    expect(cart.subtotalEstimado, 0);
  });

  test('adicionar consolida quantidade do mesmo produto', () {
    const item = CarrinhoItem(idProduto: 1, nomeProduto: 'Arroz', preco: 10);
    cart.adicionar(item);
    cart.adicionar(item);

    expect(cart.itens, hasLength(1));
    expect(cart.quantidadeTotal, 2);
    expect(cart.total, 20);
  });

  test('decrementar remove item quando chega a zero', () {
    cart.adicionar(
      const CarrinhoItem(idProduto: 1, nomeProduto: 'Arroz', preco: 10),
    );
    cart.decrementar(1);
    expect(cart.itens, isEmpty);
  });

  test('incrementar, remover e limpar mantêm estado observável', () {
    cart.adicionar(
      const CarrinhoItem(idProduto: 1, nomeProduto: 'Arroz', preco: 10),
    );
    cart.incrementar(1);
    expect(cart.quantidadeTotal, 2);
    expect(cart.subtotalEstimado, 20);
    cart.remover(1);
    expect(cart.itens, isEmpty);
    cart.adicionar(
      const CarrinhoItem(idProduto: 2, nomeProduto: 'Feijão', preco: 8),
    );
    cart.limpar();
    expect(cart.itens, isEmpty);
  });
}
