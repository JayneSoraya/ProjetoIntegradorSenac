import 'package:flutter/material.dart';

import '../core/format/formatadores.dart';
import '../core/network/mensagem_erro.dart';
import '../models/historico_compras.dart';
import '../services/historico_service.dart';
import '../theme/app_theme.dart';
import '../widgets/estado_tela.dart';
import 'historico_preco_screen.dart';

/// Itens de uma nota fiscal importada. Cada item leva ao histórico de preços do produto.
class HistoricoDetalheScreen extends StatefulWidget {
  final int idNota;
  const HistoricoDetalheScreen({super.key, required this.idNota});

  @override
  State<HistoricoDetalheScreen> createState() => _HistoricoDetalheScreenState();
}

class _HistoricoDetalheScreenState extends State<HistoricoDetalheScreen> {
  CompraDetalhe? _compra;
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
      final compra = await HistoricoService.detalharCompra(widget.idNota);
      if (!mounted) return;
      setState(() {
        _compra = compra;
        _carregando = false;
      });
    } catch (erro) {
      if (!mounted) return;
      setState(() {
        _erro = mensagemDeErro(
          erro,
          padrao:
              'Não foi possível carregar esta compra. Verifique sua conexão e tente novamente.',
        );
        _carregando = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalhe da compra')),
      body: _corpo(),
    );
  }

  Widget _corpo() {
    if (_carregando) {
      return const Center(child: CircularProgressIndicator());
    }
    final compra = _compra;
    if (_erro != null || compra == null) {
      return EstadoErro(
        mensagem: _erro ?? 'Compra indisponível.',
        onTentarNovamente: _carregar,
      );
    }

    return Column(
      children: [
        _Cabecalho(compra: compra),
        Expanded(
          child: compra.itens.isEmpty
              ? const EstadoVazio(
                  icone: Icons.shopping_basket_outlined,
                  titulo: 'Nenhum item nesta nota',
                  mensagem: 'Esta nota não possui itens registrados.',
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: compra.itens.length,
                  itemBuilder: (_, indice) =>
                      _ItemTile(item: compra.itens[indice]),
                ),
        ),
      ],
    );
  }
}

class _Cabecalho extends StatelessWidget {
  final CompraDetalhe compra;
  const _Cabecalho({required this.compra});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      color: AppColors.primary.withValues(alpha: 0.06),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            compra.supermercado,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            formatarData(compra.dataCompra, comHora: true),
            style: const TextStyle(color: Colors.grey, fontSize: 13),
          ),
          if (compra.endereco != null && compra.endereco!.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(
              compra.endereco!,
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
          const SizedBox(height: 12),
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 12,
            children: [
              Text(
                '${compra.totalItens} ${compra.totalItens == 1 ? 'produto' : 'produtos'}',
                style: const TextStyle(color: Colors.grey),
              ),
              Text(
                'Total: ${formatarMoeda(compra.total)}',
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
    );
  }
}

class _ItemTile extends StatelessWidget {
  final CompraItem item;
  const _ItemTile({required this.item});

  @override
  Widget build(BuildContext context) {
    final idProduto = item.idProduto;
    final unidade = (item.unidade ?? '').trim();
    final quantidade =
        '${formatarQuantidade(item.quantidade)}${unidade.isEmpty ? '' : ' $unidade'}';

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: idProduto == null
            ? null
            : () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => HistoricoPrecoScreen(
                    idProduto: idProduto,
                    nomeProduto: item.nomeProduto,
                  ),
                ),
              ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.nomeProduto,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$quantidade × ${formatarMoeda(item.precoUnitario)}',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                formatarMoeda(item.subtotal),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
              if (idProduto != null)
                const Icon(Icons.chevron_right, color: Colors.grey, size: 18),
            ],
          ),
        ),
      ),
    );
  }
}
