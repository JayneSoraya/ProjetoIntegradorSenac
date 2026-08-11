import 'dart:async';

import 'package:flutter/material.dart';
import '../controller/carrinho_controller.dart';
import '../widgets/cart_scope.dart';
import '../controller/produto_controller.dart';
import '../models/carrinho_item.dart';
import '../models/produto_dto.dart';
import '../repository/produto_repository.dart';
import '../theme/app_theme.dart';
import '../widgets/produto_card.dart';
import 'carrinho_screen.dart';

class ProdutosScreen extends StatefulWidget {
  const ProdutosScreen({super.key});

  @override
  State<ProdutosScreen> createState() => _ProdutosScreenState();
}

class _ProdutosScreenState extends State<ProdutosScreen> {
  late CarrinhoController cart;
  final controller = ProdutoController(ProdutoRepository());
  Timer? _debounce;
  List<ProdutoDTO> products = [];
  bool loading = true;
  String category = 'Todos';
  String search = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    cart = CartScope.of(context);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    controller.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => loading = true);
    try {
      final result = await controller.buscarProduto(
        search,
        categoria: category == 'Todos' ? '' : category,
      );
      if (!mounted) return;
      setState(() {
        products = result;
        loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erro ao carregar produtos.')),
      );
    }
  }

  void _scheduleSearch(String value) {
    search = value;
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), _load);
  }

  int quantityFor(int productId) {
    for (final item in cart.itens) {
      if (item.idProduto == productId) return item.quantidade;
    }
    return 0;
  }

  void add(ProdutoDTO product) => cart.adicionar(
    CarrinhoItem(
      idProduto: product.idProduto,
      nomeProduto: product.nomeProduto,
      preco: product.preco,
    ),
  );

  void remove(ProdutoDTO product) => cart.decrementar(product.idProduto);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Produtos'),
        actions: [
          ListenableBuilder(
            listenable: cart,
            builder: (_, _) => Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.shopping_cart_outlined),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const CarrinhoScreen()),
                  ),
                ),
                if (cart.quantidadeTotal > 0)
                  Positioned(
                    right: 4,
                    top: 4,
                    child: CircleAvatar(
                      radius: 9,
                      backgroundColor: AppColors.primary,
                      child: Text(
                        '${cart.quantidadeTotal}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: TextField(
                onChanged: _scheduleSearch,
                decoration: InputDecoration(
                  hintText: 'Procure por produto, marca ou código',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: Colors.grey.shade100,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(28),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: ['Todos', 'Alimentos', 'Limpeza', 'Bebidas', 'Outros']
                    .map(
                      (value) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(value),
                          selected: category == value,
                          onSelected: (_) {
                            setState(() => category = value);
                            _load();
                          },
                        ),
                      ),
                    )
                    .toList(),
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: loading
                  ? const Center(child: CircularProgressIndicator())
                  : products.isEmpty
                  ? const Center(child: Text('Nenhum produto encontrado.'))
                  : ListenableBuilder(
                      listenable: cart,
                      builder: (_, _) => ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                        itemCount: products.length,
                        itemBuilder: (_, index) {
                          final product = products[index];
                          return ProdutoCard(
                            nome: product.nomeProduto,
                            marca: product.marca,
                            peso: product.peso > 0
                                ? '${product.peso} ${product.unidadeMedida}'
                                : product.unidadeMedida,
                            preco: product.preco,
                            quantidade: quantityFor(product.idProduto),
                            onAdicionar: () => add(product),
                            onRemover: () => remove(product),
                          );
                        },
                      ),
                    ),
            ),
            ListenableBuilder(
              listenable: cart,
              builder: (_, _) => cart.quantidadeTotal == 0
                  ? const SizedBox.shrink()
                  : Container(
                      margin: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(22),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${cart.quantidadeTotal} itens no carrinho',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Estimativa atual: R\$ ${cart.total.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const CarrinhoScreen(),
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                            ),
                            child: const Text('Ver carrinho'),
                          ),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
