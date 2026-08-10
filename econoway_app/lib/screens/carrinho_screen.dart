import 'package:flutter/material.dart';
import '../controller/carrinho_controller.dart';
import '../models/carrinho_item.dart';
import 'carrinho_vazio_screen.dart';
import '../theme/app_theme.dart';
import 'comparacao_screen.dart';

class CarrinhoScreen extends StatefulWidget {
  const CarrinhoScreen({super.key});

  @override
  State<CarrinhoScreen> createState() => _CarrinhoScreenState();
}

class _CarrinhoScreenState extends State<CarrinhoScreen> {
  final CarrinhoController carrinho = CarrinhoController();

  void _aumentar(CarrinhoItem item) {
    carrinho.adicionar(
      CarrinhoItem(
        idProduto: item.idProduto,
        nomeProduto: item.nomeProduto,
        preco: item.preco,
      ),
    );
    setState(() {});
  }

  void _diminuir(CarrinhoItem item) {
    if (item.quantidade <= 1) {
      carrinho.remover(item.idProduto);
    } else {
      item.quantidade--;
    }
    setState(() {});
  }

  void _removerTudo(CarrinhoItem item) {
    carrinho.remover(item.idProduto);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final itens = carrinho.itens;
    if (itens.isEmpty) {
      return const CarrinhoVazioScreen();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Carrinho'),
        actions: [
          if (itens.isNotEmpty)
            TextButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: const Text('Limpar carrinho'),
                    content: const Text('Deseja remover todos os produtos?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancelar'),
                      ),
                      TextButton(
                        onPressed: () {
                          for (final item in [...itens]) {
                            carrinho.remover(item.idProduto);
                          }
                          setState(() {});
                          Navigator.pop(context);
                        },
                        child: const Text(
                          'Limpar',
                          style: TextStyle(color: Colors.red),
                        ),
                      ),
                    ],
                  ),
                );
              },
              child: const Text('Limpar', style: TextStyle(color: Colors.red)),
            ),
        ],
      ),
      body: _buildLista(itens),
    );
  }

  // ── Carrinho com itens ─────────────────────────────────────
  Widget _buildLista(List<CarrinhoItem> itens) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: itens.length,
            itemBuilder: (_, index) => _buildItemCard(itens[index]),
          ),
        ),

        // ── Rodapé ──────────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 10,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${carrinho.quantidadeTotal} ${carrinho.quantidadeTotal == 1 ? "item" : "itens"}',
                    style: const TextStyle(color: Colors.grey),
                  ),
                  Text(
                    'R\$ ${carrinho.total.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const ComparacaoScreen(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Comparar preços',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Card de cada item ──────────────────────────────────────
  Widget _buildItemCard(CarrinhoItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 8),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.shopping_bag_outlined, size: 28),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.nomeProduto,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'R\$ ${item.preco.toStringAsFixed(2)} cada',
                  style: const TextStyle(color: Colors.grey, fontSize: 13),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              GestureDetector(
                onTap: () => _removerTudo(item),
                child: const Icon(Icons.close, size: 18, color: Colors.grey),
              ),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove, size: 18),
                      onPressed: () => _diminuir(item),
                      padding: const EdgeInsets.all(4),
                      constraints: const BoxConstraints(),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Text(
                        item.quantidade.toString(),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.add, size: 18),
                      onPressed: () => _aumentar(item),
                      padding: const EdgeInsets.all(4),
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'R\$ ${item.total.toStringAsFixed(2)}',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
