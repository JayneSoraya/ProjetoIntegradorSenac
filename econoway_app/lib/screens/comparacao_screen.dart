import 'dart:convert';

import 'package:econoway_app/theme/app_theme.dart';
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

  double get economiaSelecionada {
    if (mercadoSelecionadoIndex == null) return 0;
    final selecionado = mercadosOrdenados[mercadoSelecionadoIndex!];

    if (!selecionado.carrinhoCompleto) return 0;

    final completos = mercadosOrdenados
        .where((m) => m.carrinhoCompleto)
        .toList();
    if (completos.isEmpty) return 0;

    final menorPreco = completos.first.total;
    final diferenca = selecionado.total - menorPreco;
    return diferenca > 0 ? diferenca : 0;
  }

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
        print('STATUS: ${response.statusCode}');
        print(response.body);

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

    if (filtro == 'Melhor avaliação') {
      lista.sort((a, b) => b.avaliacao.compareTo(a.avaliacao));
    }

    //if (filtro == 'Mais perto') {
    //  lista.sort((a, b) => a.distancia.compareTo(b.distancia));
    //}

    return lista;
  }

  double get economiaPotencial {
    final completos = mercadosOrdenados
        .where((m) => m.carrinhoCompleto) // ← só completos
        .toList();
    if (completos.length < 2) return 0;

    // diferença entre o mais caro e o mais barato entre completos
    final diferenca = completos.last.total - completos.first.total;
    return diferenca > 0 ? diferenca : 0;
  }

  @override
  Widget build(BuildContext context) {
    final carrinho = CarrinhoController();

    if (carrinho.itens.isEmpty) {
      return const CarrinhoVazioScreen();
    }

    if (carregando) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final ordenados = mercadosOrdenados;

    return Scaffold(
      appBar: AppBar(title: const Text('Comparação')),
      body: Padding(
        padding: const EdgeInsets.all(6),
        child: Column(
          children: [
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Comprou em qual mercado?',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
            ),

            const SizedBox(height: 15),

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

            const SizedBox(height: 15),

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
                                color: AppColors.secondary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          if (selecionado)
                            const Padding(
                              padding: EdgeInsets.only(top: 6),

                              child: Text(
                                '✅ Mercado escolhido',

                                style: TextStyle(
                                  color: AppColors.secondary,

                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                        ],
                      ),
                      trailing: Radio<int>(
                        value: index,
                        groupValue: mercadoSelecionadoIndex,
                        activeColor: AppColors.secondary,
                        onChanged: (value) {
                          setState(() {
                            mercadoSelecionadoIndex = value;
                          });
                        },
                      ),
                    ),
                  );
                },
              ),
            ),

            Container(
              padding: const EdgeInsets.all(6),
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
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        const Text('Economia potencial'),
                        Text(
                          'R\$ ${economiaPotencial.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: AppColors.secondary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            if (mercadoSelecionadoIndex != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green),
                ),
                child: Column(
                  children: [
                    Text(
                      '✅ Mercado escolhido: ${ordenados[mercadoSelecionadoIndex!].nome}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    if (ordenados[mercadoSelecionadoIndex!].carrinhoCompleto)
                      Text(
                        'Economia estimada: R\$ ${economiaSelecionada.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: Colors.green,
                          fontWeight: FontWeight.bold,
                        ),
                      )
                    
                    else
                      const Text(
                        'Este mercado não possui todos os itens da lista.',
                        style: TextStyle(
                          color: Colors.orange,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
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
