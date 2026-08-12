import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import 'historico_preco_screen.dart';

class HistoricoDetalheScreen extends StatefulWidget {
  final int idNota;
  const HistoricoDetalheScreen({super.key, required this.idNota});

  @override
  State<HistoricoDetalheScreen> createState() => _HistoricoDetalheScreenState();
}

class _HistoricoDetalheScreenState extends State<HistoricoDetalheScreen> {
  static const String _baseUrl = 'http://192.168.1.11:3333/api/historico';

  Map<String, dynamic>? _nota;
  List<Map<String, dynamic>> _itens = [];
  bool _carregando = true;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    final token = await AuthService.getToken();
    final response = await http.get(
      Uri.parse('$_baseUrl/compras/${widget.idNota}'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      setState(() {
        _nota = data['nota'];
        _itens = List<Map<String, dynamic>>.from(data['itens']);
        _carregando = false;
      });
    } else {
      setState(() => _carregando = false);
    }
  }

  String _formatarData(String? dataStr) {
    if (dataStr == null) return '—';
    try {
      final data = DateTime.parse(dataStr);
      return DateFormat('dd/MM/yyyy HH:mm', 'pt_BR').format(data);
    } catch (_) {
      return dataStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_nota?['supermercado'] ?? 'Detalhe da Compra'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: _carregando
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : Column(
              children: [
                // ── Cabeçalho da nota ──────────────────────
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  color: AppColors.primary.withOpacity(0.06),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _nota?['supermercado'] ?? '—',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _formatarData(_nota?['data_compra']),
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${_itens.length} produtos',
                            style: const TextStyle(color: Colors.grey),
                          ),
                          Text(
                            'Total: R\$ ${double.tryParse(_nota?['valor_total']?.toString() ?? '0')?.toStringAsFixed(2) ?? '0,00'}',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // ── Lista de itens ─────────────────────────
                Expanded(
                  child: _itens.isEmpty
                      ? const Center(
                          child: Text(
                            'Nenhum item encontrado.',
                            style: TextStyle(color: Colors.grey),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _itens.length,
                          itemBuilder: (_, i) {
                            final item = _itens[i];
                            final qtd =
                                double.tryParse(
                                  item['quantidade']?.toString() ?? '1',
                                ) ??
                                1;
                            final vlUnit =
                                double.tryParse(
                                  item['valor_unitario']?.toString() ?? '0',
                                ) ??
                                0;
                            final subtotal =
                                double.tryParse(
                                  item['subtotal']?.toString() ?? '0',
                                ) ??
                                0;

                            return InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => HistoricoPrecosScreen(
                                    idProduto: item['id_produto'] as int,
                                    nomeProduto: item['nome_produto'] ?? '—',
                                  ),
                                ),
                              ),
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 12,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.04),
                                      blurRadius: 6,
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item['nome_produto'] ?? '—',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            '${qtd.toStringAsFixed(qtd == qtd.roundToDouble() ? 0 : 3)} ${item['unidade'] ?? ''} × R\$ ${vlUnit.toStringAsFixed(2)}',
                                            style: const TextStyle(
                                              color: Colors.grey,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),

                                    Row(
                                      children: [
                                        Text(
                                          'R\$ ${subtotal.toStringAsFixed(2)}',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        const Icon(
                                          Icons.chevron_right,
                                          color: Colors.grey,
                                          size: 18,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
