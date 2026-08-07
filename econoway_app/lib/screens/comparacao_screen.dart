import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../controller/carrinho_controller.dart';
import '../services/auth_service.dart';
import '../models/mercado_comparacao_dto.dart';
import 'avaliacao_screen.dart';
import 'carrinho_vazio_screen.dart';

class ComparacaoScreen extends StatefulWidget {
  const ComparacaoScreen({super.key});

  @override
  State<ComparacaoScreen> createState() => _ComparacaoScreenState();
}

class _ComparacaoScreenState extends State<ComparacaoScreen> {
  int? mercadoSelecionadoIndex;

  String filtro = 'Menor preço';

  bool carregando = true;

  List<MercadoComparacaoDTO> mercados = [];

  @override
  void initState() {
    super.initState();
    carregarComparacao();
  }

  Future<void> carregarComparacao() async {
    try {
      final carrinho = CarrinhoController();

      final token = await AuthService.getToken();

      final response = await http.post(
        Uri.parse('http://192.168.1.11:3333/api/comparacao'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'itens': carrinho.itens
              .map(
                (e) => {'idProduto': e.idProduto, 'quantidade': e.quantidade},
              )
              .toList(),
        }),
      );

      if (response.statusCode == 200) {
        final List dados = jsonDecode(response.body);

        setState(() {
          mercados = dados
              .map((e) => MercadoComparacaoDTO.fromJson(e))
              .toList();

          carregando = false;
        });
      } else {
        throw Exception('Erro ${response.statusCode}');
      }
    } catch (e) {
      debugPrint(e.toString());

      setState(() {
        carregando = false;
      });
    }
  }

  List<MercadoComparacaoDTO> get mercadosOrdenados {
    final lista = [...mercados];

    if (filtro == 'Menor preço') {
      lista.sort((a, b) => a.total.compareTo(b.total));
    }

    //if (filtro == 'Melhor avaliação') {
    //lista.sort((a, b) => b.avaliacao.compareTo(a.avaliacao));
    //}

    //if (filtro == 'Mais perto') {
    //  lista.sort((a, b) => a.distancia.compareTo(b.distancia));
    //}

    return lista;
  }

  double get economiaPotencial {
    if (mercados.isEmpty) return 0;

    final carrinho = CarrinhoController();

    final menorPreco = mercadosOrdenados.first.total;

    final diferenca = carrinho.total - menorPreco;

    return diferenca > 0 ? diferenca : 0;
  }

  @override
  Widget build(BuildContext context) {
    final carrinho = CarrinhoController();

    if (carrinho.itens.isNotEmpty) {
      return const CarrinhoVazioScreen();
    }

    if (carregando) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final ordenados = mercadosOrdenados;

    return Scaffold(
      appBar: AppBar(title: const Text('Comparação')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Comparação de mercados',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
            ),

            const SizedBox(height: 16),

            DropdownButton<String>(
              value: filtro,
              items: const [
                DropdownMenuItem(
                  value: 'Menor preço',
                  child: Text('Menor preço'),
                ),
                DropdownMenuItem(
                  value: 'Melhor avaliação',
                  child: Text('Melhor avaliação'),
                ),
                DropdownMenuItem(
                  value: 'Mais perto',
                  child: Text('Mais perto'),
                ),
              ],
              onChanged: (v) {
                setState(() {
                  filtro = v!;
                  mercadoSelecionadoIndex = null;
                });
              },
            ),

            const SizedBox(height: 16),

            Expanded(
              child: ListView.builder(
                itemCount: ordenados.length,
                itemBuilder: (_, index) {
                  final mercado = ordenados[index];

                  final selecionado = mercadoSelecionadoIndex == index;

                  final maisBarato = filtro == 'Menor preço' && index == 0;

                  return Card(
                    child: ListTile(
                      selected: selecionado,
                      onTap: () {
                        setState(() {
                          mercadoSelecionadoIndex = index;
                        });
                      },
                      title: Row(
                        children: [
                          Expanded(child: Text(mercado.nome)),
                          if (maisBarato)
                            const Chip(label: Text('Mais barato')),
                        ],
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Total: R\$ ${mercado.total.toStringAsFixed(2)}',
                          ),
                          Text(
                            '${mercado.itensEncontrados}/${mercado.totalItens} produtos',
                          ),

                          if (!mercado.carrinhoCompleto)
                            Text(
                              '${mercado.itensFaltando} item(ns) faltando',
                              style: const TextStyle(color: Colors.orange),
                            ),

                          if (mercado.carrinhoCompleto)
                            const Text(
                              'Carrinho completo',
                              style: TextStyle(
                                color: Colors.green,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                        ],
                      ),
                      trailing: selecionado
                          ? const Icon(Icons.check_circle, color: Colors.green)
                          : null,
                    ),
                  );
                },
              ),
            ),

            Container(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Itens'),
                      Text(carrinho.quantidadeTotal.toString()),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Subtotal'),
                      Text('R\$ ${carrinho.total.toStringAsFixed(2)}'),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Mercados'),
                      Text(mercados.length.toString()),
                    ],
                  ),
                  if (economiaPotencial > 0) ...[
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Economia potencial'),
                        Text(
                          'R\$ ${economiaPotencial.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: mercadoSelecionadoIndex == null
                    ? null
                    : () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => AvaliacaoScreen(
                              nomeMercado:
                                  ordenados[mercadoSelecionadoIndex!].nome,
                            ),
                          ),
                        );
                      },
                child: const Text('Avaliar mercado'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
