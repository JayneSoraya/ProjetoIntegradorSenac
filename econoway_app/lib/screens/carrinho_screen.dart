import 'package:flutter/material.dart';
import '../widgets/cart_scope.dart';
import '../theme/app_theme.dart';
import '../services/carrinho_service.dart';
import 'carrinho_vazio_screen.dart';
import 'supermercados_screen.dart';

class CarrinhoScreen extends StatelessWidget {
  const CarrinhoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = CartScope.of(context);
    return ListenableBuilder(
      listenable: cart,
      builder: (context, _) {
        if (cart.itens.isEmpty) return const CarrinhoVazioScreen();
        return Scaffold(
          appBar: AppBar(title: const Text('Carrinho')),
          body: SafeArea(
            child: Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: cart.itens.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (_, index) {
                      final item = cart.itens[index];
                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.nomeProduto,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'R\$ ${item.preco.toStringAsFixed(2)} por unidade',
                                      style: const TextStyle(
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                onPressed: () =>
                                    cart.decrementar(item.idProduto),
                                icon: const Icon(Icons.remove_circle_outline),
                              ),
                              Text(
                                '${item.quantidade}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              IconButton(
                                onPressed: () =>
                                    cart.incrementar(item.idProduto),
                                icon: const Icon(Icons.add_circle_outline),
                              ),
                              IconButton(
                                onPressed: () => cart.remover(item.idProduto),
                                icon: const Icon(
                                  Icons.delete_outline,
                                  color: Colors.redAccent,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
                  decoration: BoxDecoration(
                    color: Theme.of(context).cardColor,
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x14000000),
                        blurRadius: 14,
                        offset: Offset(0, -4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${cart.quantidadeTotal} item(ns)',
                            style: const TextStyle(color: Colors.grey),
                          ),
                          Text(
                            'Subtotal estimado R\$ ${cart.total.toStringAsFixed(2)}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: ElevatedButton(
                          onPressed: () async {
                            try {
                              await CarrinhoService.salvar(cart.itens);
                              if (!context.mounted) return;
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const SupermercadosScreen(
                                    selecionarParaComparacao: true,
                                  ),
                                ),
                              );
                            } catch (_) {
                              if (!context.mounted) return;
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    'Não foi possível sincronizar o carrinho.',
                                  ),
                                ),
                              );
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Escolher mercados e comparar'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
