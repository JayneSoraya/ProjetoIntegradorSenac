import 'package:flutter/material.dart';

import '../core/format/formatadores.dart';
import '../core/network/mensagem_erro.dart';
import '../models/historico_compras.dart';
import '../services/historico_service.dart';
import '../theme/app_theme.dart';
import '../widgets/estado_tela.dart';
import 'historico_detalhe_screen.dart';
import 'scan_nota_screen.dart';

/// Lista as notas fiscais (NFC-e) importadas pela pessoa usuária.
class HistoricoComprasScreen extends StatefulWidget {
  const HistoricoComprasScreen({super.key});

  @override
  State<HistoricoComprasScreen> createState() => _HistoricoComprasScreenState();
}

class _HistoricoComprasScreenState extends State<HistoricoComprasScreen> {
  List<CompraResumo> _compras = [];
  bool _carregando = true;
  String? _erro;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    setState(() {
      _carregando = true;
      _erro = null;
    });
    try {
      final compras = await HistoricoService.listarCompras();
      if (!mounted) return;
      setState(() {
        _compras = compras;
        _carregando = false;
      });
    } catch (erro) {
      if (!mounted) return;
      setState(() {
        _erro = mensagemDeErro(
          erro,
          padrao:
              'Não foi possível carregar suas compras. Verifique sua conexão e tente novamente.',
        );
        _carregando = false;
      });
    }
  }

  Future<void> _abrirScanner() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const ScanNotaScreen()),
    );
    if (mounted) _carregar();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Minhas compras')),
      body: _corpo(),
    );
  }

  Widget _corpo() {
    if (_carregando) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_erro != null) {
      return EstadoErro(mensagem: _erro!, onTentarNovamente: _carregar);
    }
    if (_compras.isEmpty) {
      return EstadoVazio(
        icone: Icons.receipt_long_outlined,
        titulo: 'Nenhuma compra importada ainda',
        mensagem:
            'Escaneie o QR Code de uma NFC-e para registrar sua compra e ajudar a atualizar os preços.',
        rotuloAcao: 'Escanear nota',
        onAcao: _abrirScanner,
      );
    }
    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _carregar,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: _compras.length,
        itemBuilder: (_, indice) => _CompraCard(compra: _compras[indice]),
      ),
    );
  }
}

class _CompraCard extends StatelessWidget {
  final CompraResumo compra;
  const _CompraCard({required this.compra});

  @override
  Widget build(BuildContext context) {
    final itens = compra.totalItens;
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => HistoricoDetalheScreen(idNota: compra.idNota),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.receipt_long_outlined,
                  color: AppColors.primary,
                  size: 26,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      compra.supermercado,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${formatarData(compra.dataCompra)} · $itens ${itens == 1 ? 'produto' : 'produtos'}',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                formatarMoeda(compra.total),
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}
