import 'package:flutter/material.dart';
import '../controller/carrinho_controller.dart';
import '../controller/produto_controller.dart';
import '../models/carrinho_item.dart';
import '../models/produto_dto.dart';
import '../repository/produto_repository.dart';
import 'comparacao_screen.dart';
import 'carrinho_screen.dart';
import '../widgets/produto_card.dart';

class ProdutosScreen extends StatefulWidget {
  const ProdutosScreen({super.key});

  @override
  State<ProdutosScreen> createState() => _ProdutosScreenState();
}

class _ProdutosScreenState extends State<ProdutosScreen> {
  // ── Controllers ────────────────────────────────────────────
  final CarrinhoController carrinho = CarrinhoController();
  final controller = ProdutoController(ProdutoRepository());

  // ── Estado ─────────────────────────────────────────────────
  List<ProdutoDTO> produtos = [];
  bool carregando = true;
  String categoriaSelecionada = 'Outros';
  String textoBusca = '';

  // ── Ciclo de vida ──────────────────────────────────────────
  @override
  void initState() {
    super.initState();
    carregarProdutos();
  }

  Future<void> carregarProdutos() async {
    print('INICIANDO BUSCA DE PRODUTOS');
    try {
      final resultado = await controller.buscarProduto('');
      print('TOTAL PRODUTOS: ${resultado.length}');
      for (final p in resultado.take(5)) {
        print('${p.nomeProduto} - ${p.preco}');
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
    // Loading inicial
    if (carregando) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    // Filtro local por categoria + texto de busca
    final filtrados = produtos.where((p) {
      final categoriaOk =
          categoriaSelecionada == 'Outros' ||
          p.categoria == categoriaSelecionada;
      final buscaOk =
          textoBusca.isEmpty ||
          p.nomeProduto.toLowerCase().contains(textoBusca.toLowerCase()) ||
          p.marca.toLowerCase().contains(textoBusca.toLowerCase());
      return categoriaOk && buscaOk;
    }).toList();

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
                          color: Colors.green,
                        ),
                        onPressed: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const CarrinhoScreen(),
                            ),
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
                              color: Colors.green,
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
                  prefixIcon: const Icon(Icons.search, color: Colors.green),
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
                    _categoriaChip('Outros'),
                    _categoriaChip('Alimentos'),
                    _categoriaChip('Limpeza'),
                    _categoriaChip('Bebidas'),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ── Lista de produtos ───────────────────────────
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
                            marca: produto.marca,
                            peso: produto.peso.toString(),
                            preco: produto.preco,
                            quantidade: qtd,
                            onAdicionar: () => adicionarProduto(produto),
                            onRemover: () => removerProduto(produto),
                          );
                        },
                      ),
              ),

              // ── Rodapé: total + botão ───────────────────────
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
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

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
                    backgroundColor: Colors.green,
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

  // ── Chip de categoria ──────────────────────────────────────
  Widget _categoriaChip(String categoria) {
    final selecionado = categoriaSelecionada == categoria;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        selected: selecionado,
        label: Text(categoria),
        selectedColor: Colors.green,
        labelStyle: TextStyle(color: selecionado ? Colors.white : Colors.black),
        onSelected: (_) => setState(() => categoriaSelecionada = categoria),
      ),
    );
  }
}
