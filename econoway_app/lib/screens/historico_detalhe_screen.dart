import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../core/config/app_config.dart';
import 'historico_preco_screen.dart';
import 'sefaz_webview_screen.dart';

class HistoricoDetalheScreen extends StatefulWidget {
  final int idNota;
  const HistoricoDetalheScreen({super.key, required this.idNota});

  @override
  State<HistoricoDetalheScreen> createState() => _HistoricoDetalheScreenState();
}

class _HistoricoDetalheScreenState extends State<HistoricoDetalheScreen> {
  Map<String, dynamic>? _nota;
  List<Map<String, dynamic>> _itens = [];
  bool _carregando = true;
  bool _sincronizando = false;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    try {
      final token = await AuthService.getToken();
      final url = AppConfig.endpoint('/historico/compras/${widget.idNota}');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
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
    } catch (_) {
      setState(() => _carregando = false);
    }
  }

  // ── Função para Sincronizar com a SEFAZ Manualmente ──
  Future<void> _sincronizarSefaz() async {
    setState(() => _sincronizando = true);

    try {
      final token = await AuthService.getToken();
      final url = AppConfig.endpoint('/notas/${widget.idNota}/sincronizar');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final contentType = response.headers['content-type'] ?? '';
      if (!contentType.contains('application/json')) {
        throw Exception('O servidor retornou uma página de erro inesperada.');
      }

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['sucesso'] == true) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Nota sincronizada com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
        await _carregar();
      } else {
        // Se falhou por contingência/assinatura da SEFAZ
        if (!mounted) return;

        final chaveNfce = data['chave_nfce'] ?? _nota?['chave_nfce'];
        if (chaveNfce != null && chaveNfce.toString().startsWith('http')) {
          // Abre a tela de WebView para o usuário digitar o Captcha
          final atualizou = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => SefazWebviewScreen(
                idNota: widget.idNota,
                urlSefaz: chaveNfce,
              ),
            ),
          );

          if (atualizou == true) {
            await _carregar();
          }
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(data['erro'] ?? 'SEFAZ indisponível.'),
              backgroundColor: Colors.orange[800],
            ),
          );
        }
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Falha de conexão: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _sincronizando = false);
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
    final bool emContingencia = _nota?['status'] == 'CONTINGENCIA';

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
                // ── Cabeçalho da Nota ──────────────────────
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  color: emContingencia
                      ? Colors.amber.withValues(alpha: 0.08)
                      : AppColors.primary.withValues(alpha: 0.06),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              _nota?['supermercado'] ?? '—',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: emContingencia
                                    ? Colors.amber[900]
                                    : AppColors.primary,
                              ),
                            ),
                          ),
                          if (emContingencia)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.amber,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'Contingência',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                        ],
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
                            emContingencia
                                ? '⚠️ Aguardando SEFAZ'
                                : '${_itens.length} produtos',
                            style: TextStyle(
                              color: emContingencia
                                  ? Colors.amber[800]
                                  : Colors.grey,
                              fontWeight: emContingencia
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                            ),
                          ),
                          Text(
                            'Total: R\$ ${double.tryParse(_nota?['valor_total']?.toString() ?? '0')?.toStringAsFixed(2) ?? '0,00'}',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: emContingencia
                                  ? Colors.amber[900]
                                  : AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // ── Banner de Contingência com Botão de Sincronização ──
                if (emContingencia)
                  Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.amber.withValues(alpha: 0.1),
                      border: Border.all(color: Colors.amber),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: const [
                            Icon(
                              Icons.warning_amber_rounded,
                              color: Colors.amber,
                              size: 28,
                            ),
                            SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Esta nota está em contingência. Os produtos aparecerão assim que a SEFAZ normalizar a consulta.',
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Botão de Ação Manual
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _sincronizando
                                ? null
                                : _sincronizarSefaz,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.amber[800],
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                            icon: _sincronizando
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Icon(Icons.sync, size: 20),
                            label: Text(
                              _sincronizando
                                  ? 'Consultando SEFAZ...'
                                  : 'Sincronizar com SEFAZ Agora',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                // ── Lista de Itens ─────────────────────────
                Expanded(
                  child: _itens.isEmpty
                      ? Center(
                          child: Text(
                            emContingencia
                                ? 'Nenhum produto listado no momento.'
                                : 'Nenhum item encontrado.',
                            style: const TextStyle(color: Colors.grey),
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
                                      color: Colors.black.withValues(
                                        alpha: 0.04,
                                      ),
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
