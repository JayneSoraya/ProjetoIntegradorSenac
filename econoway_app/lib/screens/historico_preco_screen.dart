import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class HistoricoPrecosScreen extends StatefulWidget {
  final int idProduto;
  final String nomeProduto;

  const HistoricoPrecosScreen({
    super.key,
    required this.idProduto,
    required this.nomeProduto,
  });

  @override
  State<HistoricoPrecosScreen> createState() => _HistoricoPrecosScreenState();
}

class _HistoricoPrecosScreenState extends State<HistoricoPrecosScreen> {
  static const String _baseUrl = 'http://192.168.1.11:3333/api/historico';

  Map<String, dynamic>? _dados;
  bool _carregando = true;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    final token = await AuthService.getToken();
    final response = await http.get(
      Uri.parse('$_baseUrl/precos/${widget.idProduto}'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      setState(() {
        _dados = jsonDecode(response.body);
        _carregando = false;
      });
    } else {
      setState(() => _carregando = false);
    }
  }

  String _formatarMes(String? dataStr) {
    if (dataStr == null) return '—';
    try {
      final data = DateTime.parse(dataStr);
      return DateFormat('MMM/yy', 'pt_BR').format(data);
    } catch (_) {
      return dataStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    final precosAtuais = _dados?['precos_atuais'] as List? ?? [];
    final historico = _dados?['historico'] as List? ?? [];

    // Agrupa histórico por supermercado
    final Map<String, List<Map<String, dynamic>>> porMercado = {};
    for (final h in historico) {
      final nome = h['supermercado'] as String? ?? '—';
      porMercado.putIfAbsent(nome, () => []).add(h);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.nomeProduto,
            style: const TextStyle(fontSize: 16)),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: _carregando
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Preços atuais ──────────────────────────
                  const Text(
                    'Preço atual por mercado',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppColors.primary),
                  ),
                  const SizedBox(height: 12),

                  if (precosAtuais.isEmpty)
                    const Text('Nenhum preço cadastrado.',
                        style: TextStyle(color: Colors.grey))
                  else
                    ...precosAtuais.asMap().entries.map((entry) {
                      final i = entry.key;
                      final p = entry.value as Map<String, dynamic>;
                      final preco =
                          double.tryParse(p['preco_atual']?.toString() ?? '0') ??
                              0;
                      final maisBarato = i == 0;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: maisBarato
                              ? AppColors.secondary.withOpacity(0.08)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: maisBarato
                                ? AppColors.secondary
                                : Colors.grey.shade200,
                            width: maisBarato ? 2 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    p['supermercado'] ?? '—',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold),
                                  ),
                                  if (p['data_atualizacao'] != null)
                                    Text(
                                      'Atualizado: ${_formatarMes(p['data_atualizacao'])}',
                                      style: const TextStyle(
                                          color: Colors.grey, fontSize: 11),
                                    ),
                                ],
                              ),
                            ),
                            if (maisBarato)
                              Container(
                                margin: const EdgeInsets.only(right: 8),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.secondary,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text('Mais barato',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold)),
                              ),
                            Text(
                              'R\$ ${preco.toStringAsFixed(2)}',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: maisBarato
                                    ? AppColors.secondary
                                    : AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      );
                    }),

                  // ── Histórico por mercado ──────────────────
                  if (porMercado.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    const Text(
                      'Histórico de variações',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppColors.primary),
                    ),
                    const SizedBox(height: 12),

                    ...porMercado.entries.map((entry) {
                      final nomeMercado = entry.key;
                      final registros = entry.value;

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Header do mercado
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.store_outlined,
                                    color: AppColors.primary, size: 16),
                                const SizedBox(width: 6),
                                Text(
                                  nomeMercado,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Registros de preço
                          ...registros.asMap().entries.map((e) {
                            final idx = e.key;
                            final Map<String, dynamic> r = e.value;
                            final preco =
                                double.tryParse(r['preco']?.toString() ?? '0') ??
                                    0;

                            // Compara com o próximo (mais antigo)
                            double? precoAnterior;
                            if (idx + 1 < registros.length) {
                              precoAnterior = double.tryParse(
                                  registros[idx + 1]['preco']?.toString() ??
                                      '0');
                            }

                            final subiu = precoAnterior != null &&
                                preco > precoAnterior;
                            final desceu = precoAnterior != null &&
                                preco < precoAnterior;

                            return Padding(
                              padding:
                                  const EdgeInsets.only(left: 12, bottom: 6),
                              child: Row(
                                children: [
                                  // Linha do tempo
                                  Column(
                                    children: [
                                      Container(
                                          width: 8,
                                          height: 8,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: desceu
                                                ? Colors.green
                                                : subiu
                                                    ? Colors.red
                                                    : Colors.grey,
                                          )),
                                    ],
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      _formatarMes(r['registrado_em']),
                                      style: const TextStyle(
                                          color: Colors.grey, fontSize: 13),
                                    ),
                                  ),
                                  Text(
                                    'R\$ ${preco.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14),
                                  ),
                                  const SizedBox(width: 6),
                                  if (desceu)
                                    const Icon(Icons.arrow_downward,
                                        color: Colors.green, size: 16)
                                  else if (subiu)
                                    const Icon(Icons.arrow_upward,
                                        color: Colors.red, size: 16)
                                  else
                                    const SizedBox(width: 16),
                                ],
                              ),
                            );
                          }),
                          const SizedBox(height: 16),
                        ],
                      );
                    }),
                  ] else ...[
                    const SizedBox(height: 24),
                    const Text(
                      'Histórico de variações',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppColors.primary),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'Ainda não há histórico de variações.\nEle será gerado automaticamente quando o preço mudar.',
                        style: TextStyle(color: Colors.grey, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }
}