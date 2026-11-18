import 'dart:convert';
import 'dart:math' as math;
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
        Uri.parse('http://localhost:3333/api/comparacao'),
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

      if (!mounted) return;

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

      if (!mounted) return;
      setState(() {
        carregando = false;
      });
    }
  }

  // ── Ordenação ──────────────────────────────────────────────
  List<MercadoComparacaoDTO> get mercadosOrdenados {
    final lista = [...mercados];

    if (filtro == 'Menor preço') {
      lista.sort((a, b) {
        // 1º: carrinhos completos antes dos incompletos
        if (a.carrinhoCompleto != b.carrinhoCompleto) {
          return a.carrinhoCompleto ? -1 : 1;
        }
        // 2º: entre incompletos, os que faltam menos itens vêm antes
        if (!a.carrinhoCompleto) {
          final porFaltantes = a.itensFaltando.compareTo(b.itensFaltando);
          if (porFaltantes != 0) return porFaltantes;
        }
        // 3º: menor total
        return a.total.compareTo(b.total);
      });
    }

    if (filtro == 'Melhor avaliação') {
      lista.sort((a, b) {
        final porNota = b.avaliacao.compareTo(a.avaliacao);
        return porNota != 0 ? porNota : a.total.compareTo(b.total);
      });
    }

    //if (filtro == 'Mais perto') {
    //  lista.sort((a, b) => a.distancia.compareTo(b.distancia));
    //}

    return lista;
  }

  // ── Economia ───────────────────────────────────────────────
  // Só mercados com carrinho completo são comparáveis entre si.
  // Calculado direto sobre os totais, sem depender da ordenação.
  List<double> get _totaisCompletos =>
      mercados.where((m) => m.carrinhoCompleto).map((m) => m.total).toList();

  double get _menorTotalCompleto =>
      _totaisCompletos.isEmpty ? 0 : _totaisCompletos.reduce(math.min);

  double get _maiorTotalCompleto =>
      _totaisCompletos.isEmpty ? 0 : _totaisCompletos.reduce(math.max);

  // Diferença entre o mercado completo mais caro e o mais barato
  double get economiaPotencial {
    if (_totaisCompletos.length < 2) return 0;
    final diferenca = _maiorTotalCompleto - _menorTotalCompleto;
    return diferenca > 0 ? diferenca : 0;
  }

  // Quanto o usuário economiza no mercado escolhido
  // em relação ao completo mais caro.
  double get economiaSelecionada {
    if (mercadoSelecionadoIndex == null) return 0;
    final selecionado = mercadosOrdenados[mercadoSelecionadoIndex!];

    if (!selecionado.carrinhoCompleto) return 0;
    if (_totaisCompletos.length < 2) return 0;

    final diferenca = _maiorTotalCompleto - selecionado.total;
    return diferenca > 0 ? diferenca : 0;
  }

  // Quanto o mercado escolhido custa a mais que o completo mais barato
  double get acimaDoMaisBarato {
    if (mercadoSelecionadoIndex == null) return 0;
    final selecionado = mercadosOrdenados[mercadoSelecionadoIndex!];

    if (!selecionado.carrinhoCompleto) return 0;

    final diferenca = selecionado.total - _menorTotalCompleto;
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

                  // "Mais barato" só vale para carrinho completo
                  final maisBarato =
                      filtro == 'Menor preço' &&
                      index == 0 &&
                      mercado.carrinhoCompleto;

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
                      trailing: Icon(
                        selecionado
                            ? Icons.radio_button_checked
                            : Icons.radio_button_off,
                        color: selecionado ? AppColors.secondary : Colors.grey,
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
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                    if (ordenados[mercadoSelecionadoIndex!]
                        .carrinhoCompleto) ...[
                      if (economiaSelecionada > 0)
                        Text(
                          'Economia estimada: R\$ ${economiaSelecionada.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      if (acimaDoMaisBarato > 0)
                        Text(
                          'R\$ ${acimaDoMaisBarato.toStringAsFixed(2)} a mais que o mercado completo mais barato',
                          style: const TextStyle(
                            color: Colors.orange,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      else if (_totaisCompletos.length >= 2)
                        const Text(
                          'Menor preço entre os mercados com carrinho completo',
                          style: TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                    ] else
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
