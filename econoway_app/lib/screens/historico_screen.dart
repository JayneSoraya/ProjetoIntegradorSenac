import 'package:flutter/material.dart';
import '../controller/comparacao_controller.dart';

class HistoricoScreen extends StatefulWidget {
  const HistoricoScreen({super.key});
  @override
  State<HistoricoScreen> createState() => _HistoricoScreenState();
}

class _HistoricoScreenState extends State<HistoricoScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _items = [];
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ComparacaoController().historico();
      if (mounted) {
        setState(() {
          _items = data;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Histórico')),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _items.isEmpty
        ? const Center(child: Text('Nenhuma comparação salva ainda.'))
        : RefreshIndicator(
            onRefresh: _load,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _items.length,
              itemBuilder: (_, index) {
                final item = _items[index];
                final economy =
                    double.tryParse(
                      item['economia_potencial']?.toString() ?? '',
                    ) ??
                    0;
                final total =
                    double.tryParse(
                      item['valor_mercado_escolhido']?.toString() ?? '',
                    ) ??
                    0;
                final date = DateTime.tryParse(
                  item['data_comparacao']?.toString() ?? '',
                );
                return Card(
                  child: ListTile(
                    title: Text(
                      item['nome_supermercado_mais_barato']?.toString() ??
                          'Comparação',
                    ),
                    subtitle: Text(
                      '${date == null ? '' : '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year} · '}${item['total_itens'] ?? 0} item(ns)',
                    ),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'R\$ ${total.toStringAsFixed(2)}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Economia R\$ ${economy.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.green,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
  );
}
