import 'package:econoway_app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import '../controller/carrinho_controller.dart';
import '../controller/produto_controller.dart';
import '../models/carrinho_item.dart';
import '../models/produto_dto.dart';
import '../repository/produto_repository.dart';
import 'comparacao_screen.dart';
import 'carrinho_screen.dart';
import 'carrinho_vazio_screen.dart';
import '../widgets/produto_card.dart';

class ProdutosScreen extends StatefulWidget {
  const ProdutosScreen({super.key});

  @override
  State<ProdutosScreen> createState() => _ProdutosScreenState();
}

class _ProdutosScreenState extends State<ProdutosScreen> {
  final CarrinhoController carrinho = CarrinhoController();
  final controller = ProdutoController(ProdutoRepository());

  List<ProdutoDTO> produtos = [];
  bool carregando = true;

  String categoriaSelecionada = 'Todos';
  String textoBusca = '';

  @override
  void initState() {
    super.initState();
    carregarProdutos();
  }

  Future<void> carregarProdutos() async {
    try {
      final resultado = await controller.buscarProduto('');
      print('✅ Produtos carregados: ${resultado.length}');
      if (resultado.isNotEmpty) {
        print(
          'Exemplo: ${resultado.first.nomeProduto} | cat: ${resultado.first.categoria}',
        );
      }

      if (!mounted) return;
      setState(() {
        produtos = resultado;
        carregando = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => carregando = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erro ao carregar produtos')),
      );
    }
  }

  // ── Carrinho ───────────────────────────────────────────────
  int quantidadeProduto(int idProduto) {
    try {
      return carrinho.itens
          .firstWhere((i) => i.idProduto == idProduto)
          .quantidade;
    } catch (_) {
      return 0;
    }
  }

  void adicionarProduto(ProdutoDTO produto) {
    carrinho.adicionar(
      CarrinhoItem(
        idProduto: produto.idProduto,
        nomeProduto: produto.nomeProduto,
        preco: produto.preco,
      ),
    );
    setState(() {});
  }

  void removerProduto(ProdutoDTO produto) {
    final itens = carrinho.itens.where((i) => i.idProduto == produto.idProduto);
    if (itens.isEmpty) return;

    if (itens.first.quantidade <= 1) {
      carrinho.remover(produto.idProduto);
    } else {
      itens.first.quantidade--;
    }
    setState(() {});
  }

  // ── Build ──────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    if (carregando) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final filtrados = produtos.where((p) {
      final categoriaOk =
          categoriaSelecionada == 'Todos' ||
          p.categoria == categoriaSelecionada;
      final buscaOk =
          textoBusca.isEmpty ||
          p.nomeProduto.toLowerCase().contains(textoBusca.toLowerCase()) ||
          (p.marca ?? '').toLowerCase().contains(textoBusca.toLowerCase());
      return categoriaOk && buscaOk;
    }).toList();
    print('📦 Total produtos: ${produtos.length}');
    print('🔍 Busca: "$textoBusca" | Categoria: "$categoriaSelecionada"');
    print('🎯 Filtrados: ${filtrados.length}');
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // ── Cabeçalho ──────────────────────────────────
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Spacer(),
                  Stack(
                    children: [
                      IconButton(
                        icon: const Icon(
                          Icons.shopping_cart_outlined,
                          size: 30,
                          color: AppColors.primary,
                        ),
                        onPressed: () async {
                          final destino = carrinho.itens.isEmpty
                              ? const CarrinhoVazioScreen()
                              : const CarrinhoScreen();

                          await Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => destino),
                          );

                          if (!mounted) return;

                          setState(() {});
                        },
                      ),
                      if (carrinho.quantidadeTotal > 0)
                        Positioned(
                          right: 4,
                          top: 4,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: AppColors.secondary,
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              carrinho.quantidadeTotal.toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // ── Busca ───────────────────────────────────────
              TextField(
                onChanged: (v) => setState(() => textoBusca = v),
                decoration: InputDecoration(
                  hintText: 'Procure por produto ou marca',
                  prefixIcon: const Icon(
                    Icons.search,
                    color: AppColors.primary,
                  ),
                  filled: true,
                  fillColor: Colors.grey.shade200,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // ── Categorias ──────────────────────────────────
              SizedBox(
                height: 42,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _categoriaChip('Todos'),
                    _categoriaChip('Outros'),
                    _categoriaChip('Alimentos'),
                    _categoriaChip('Bebidas'),
                    _categoriaChip('Higiene e Limpeza'),
                    _categoriaChip('Carnes e Peixes'),
                    _categoriaChip('Laticínios'),
                    _categoriaChip('Snacks'),
                    _categoriaChip('Hortifruti'),
                    _categoriaChip('Padaria'),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ── Lista ──────────────────────────────────────
              Expanded(
                child: filtrados.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.search_off,
                              size: 64,
                              color: Colors.grey.shade300,
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Nenhum produto encontrado',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: filtrados.length,
                        itemBuilder: (_, index) {
                          final produto = filtrados[index];
                          final qtd = quantidadeProduto(produto.idProduto);

                          return ProdutoCard(
                            nome: produto.nomeProduto,
                            marca: produto.marca ?? '',
                            peso: produto.peso.toString(),
                            preco: produto.preco,
                            quantidade: qtd,
                            onAdicionar: () => adicionarProduto(produto),
                            onRemover: () => removerProduto(produto),
                          );
                        },
                      ),
              ),

              // ── Rodapé ──────────────────────────────────────
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total', style: TextStyle(fontSize: 14)),
                    Text(
                      'R\$ ${carrinho.total.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton(
                  onPressed: carrinho.itens.isEmpty
                      ? null
                      : () {
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
      ),
    );
  }

  Widget _categoriaChip(String categoria) {
    final selecionado = categoriaSelecionada == categoria;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        selected: selecionado,
        label: Text(categoria),
        selectedColor: AppColors.primary,
        labelStyle: TextStyle(color: selecionado ? Colors.white : Colors.black),
        onSelected: (_) => setState(() => categoriaSelecionada = categoria),
      ),
    );
  }
}
