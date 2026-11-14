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
  final ScrollController _scrollController = ScrollController();

  List<ProdutoDTO> produtos = [];
  bool carregando = true;
  bool carregandoMais = false;
  bool temMaisPaginas = true;

  String categoriaSelecionada = 'Todos';
  String textoBusca = '';
  int paginaAtual = 1;
  final int limitePorPagina = 20;

  @override
  void initState() {
    super.initState();
    carregarProdutos(reiniciar: true);

    // Listener para paginação infinita ao rolar até o fim da lista
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 200) {
        if (!carregandoMais && temMaisPaginas) {
          carregarMaisProdutos();
        }
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> carregarProdutos({bool reiniciar = false}) async {
    if (reiniciar) {
      setState(() {
        paginaAtual = 1;
        carregando = true;
        temMaisPaginas = true;
      });
    }

    try {
      final catParam = categoriaSelecionada == 'Todos'
          ? ''
          : categoriaSelecionada;

      final resultado = await controller.buscarProduto(
        textoBusca,
        categoria: catParam,
        page: paginaAtual,
        limit: limitePorPagina,
      );

      if (!mounted) return;

      setState(() {
        if (reiniciar) {
          produtos = resultado;
        } else {
          produtos.addAll(resultado);
        }

        carregando = false;
        carregandoMais = false;

        // Se vier menos itens que o limite, significa que chegamos ao fim da paginação
        if (resultado.length < limitePorPagina) {
          temMaisPaginas = false;
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        carregando = false;
        carregandoMais = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erro ao carregar produtos do servidor')),
      );
    }
  }

  Future<void> carregarMaisProdutos() async {
    if (carregandoMais || !temMaisPaginas) return;

    setState(() {
      carregandoMais = true;
      paginaAtual++;
    });

    await carregarProdutos(reiniciar: false);
  }

  // Carrinho
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Cabeçalho
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
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Busca (Com debounce implícito ou refresh ao pesquisar)
              TextField(
                onChanged: (v) {
                  setState(() => textoBusca = v);
                  // Recarrega do zero filtrando no backend
                  carregarProdutos(reiniciar: true);
                },
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

              // Categorias
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

              // Lista de produtos com paginação e indicador de loading
              Expanded(
                child: RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () => carregarProdutos(reiniciar: true),
                  child: carregando
                      ? const Center(
                          child: CircularProgressIndicator(
                            color: AppColors.primary,
                          ),
                        )
                      : produtos.isEmpty
                      ? ListView(
                          children: [
                            const SizedBox(height: 100),
                            Center(
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
                            ),
                          ],
                        )
                      : ListView.builder(
                          controller: _scrollController,
                          itemCount: produtos.length + (carregandoMais ? 1 : 0),
                          itemBuilder: (_, index) {
                            if (index == produtos.length) {
                              return const Padding(
                                padding: EdgeInsets.symmetric(vertical: 16),
                                child: Center(
                                  child: CircularProgressIndicator(
                                    color: AppColors.primary,
                                  ),
                                ),
                              );
                            }

                            final produto = produtos[index];
                            final qtd = quantidadeProduto(produto.idProduto);

                            final pesoStr = produto.peso > 0
                                ? '${produto.peso} ${produto.unidadeMedida}'
                                : '';

                            return ProdutoCard(
                              nome: produto.nomeProduto,
                              marca: produto.marca ?? '',
                              peso: pesoStr.trim(),
                              preco: produto.preco,
                              quantidade: qtd,
                              onAdicionar: () => adicionarProduto(produto),
                              onRemover: () => removerProduto(produto),
                            );
                          },
                        ),
                ),
              ),

              // Rodapé
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
        onSelected: (_) {
          setState(() => categoriaSelecionada = categoria);
          // Recarrega os produtos filtrando pela nova categoria escolhida direto no backend
          carregarProdutos(reiniciar: true);
        },
      ),
    );
  }
}
