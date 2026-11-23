import 'package:flutter/material.dart';
import '../controller/comparacao_controller.dart';
import '../widgets/estado_tela.dart';
import 'historico_compras_screen.dart';
import '../core/format/formatadores.dart';
import '../core/network/mensagem_erro.dart';

class HistoricoScreen extends StatefulWidget {
  const HistoricoScreen({super.key});
  @override
  State<HistoricoScreen> createState() => _HistoricoScreenState();
}

class _HistoricoScreenState extends State<HistoricoScreen> {
  bool _loading = true;
  String? _erro;
  List<Map<String, dynamic>> _items = [];
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (_erro != null) setState(() => _erro = null);
    try {
      final data = await ComparacaoController().historico();
      if (mounted) {
        setState(() {
          _items = data;
          _erro = null;
          _loading = false;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _erro = mensagemDeErro(
            error,
            padrao:
                'Não foi possível carregar o histórico. Verifique sua conexão e tente novamente.',
          );
          _loading = false;
        });
      }
    }
  }

  void _abrirCompras() => Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => const HistoricoComprasScreen()),
  );

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Histórico'),
      actions: [
        IconButton(
          tooltip: 'Minhas compras (notas fiscais)',
          icon: const Icon(Icons.receipt_long_outlined),
          onPressed: _abrirCompras,
        ),
      ],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _erro != null
        ? EstadoErro(mensagem: _erro!, onTentarNovamente: _load)
        : _items.isEmpty
        ? EstadoVazio(
            icone: Icons.compare_arrows,
            titulo: 'Nenhuma comparação salva ainda',
            mensagem:
                'Compare uma cesta e salve o resultado para vê-lo aqui. As notas que você importou ficam em Minhas compras.',
            rotuloAcao: 'Ver minhas compras',
            onAcao: _abrirCompras,
          )
        : RefreshIndicator(
            onRefresh: _load,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _items.length + 1,
              itemBuilder: (_, index) {
                if (index == 0) {
                  return Card(
                    child: ListTile(
                      leading: const Icon(Icons.receipt_long_outlined),
                      title: const Text('Minhas compras'),
                      subtitle: const Text('Notas fiscais que você importou'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: _abrirCompras,
                    ),
                  );
                }
                final item = _items[index - 1];
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
                final date = formatarData(item['data_comparacao'], vazio: '');
                return Card(
                  child: ListTile(
                    title: Text(
                      item['nome_supermercado_mais_barato']?.toString() ??
                          'Comparação',
                    ),
                    subtitle: Text(
                      '${date.isEmpty ? '' : '$date · '}${item['total_itens'] ?? 0} item(ns)',
                    ),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          formatarMoeda(total),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Economia ${formatarMoeda(economy)}',
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
