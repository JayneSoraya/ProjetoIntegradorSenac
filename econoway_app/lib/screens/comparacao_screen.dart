import 'package:flutter/material.dart';
import '../controller/comparacao_controller.dart';
import '../models/mercado_comparacao_dto.dart';
import '../theme/app_theme.dart';
import '../controller/carrinho_controller.dart';
import '../widgets/cart_scope.dart';

typedef ComparisonLoader =
    Future<ComparacaoResultadoDTO> Function({
      List<int>? supermercados,
      bool salvar,
    });

class ComparacaoScreen extends StatefulWidget {
  final List<int> supermercadosSelecionados;
  final ComparisonLoader? loader;
  final CarrinhoController? cart;
  const ComparacaoScreen({
    super.key,
    this.supermercadosSelecionados = const [],
    this.loader,
    this.cart,
  });

  @override
  State<ComparacaoScreen> createState() => _ComparacaoScreenState();
}

class _ComparacaoScreenState extends State<ComparacaoScreen> {
  bool _loading = true;
  bool _saving = false;
  String? _error;
  ComparacaoResultadoDTO? _result;

  @override
  void initState() {
    super.initState();
    _compare();
  }

  Future<void> _compare({bool save = false}) async {
    if (save) {
      setState(() => _saving = true);
    } else {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final load =
          widget.loader ??
          ComparacaoController(widget.cart ?? CartScope.of(context)).comparar;
      final result = await load(
        supermercados: widget.supermercadosSelecionados.isEmpty
            ? null
            : widget.supermercadosSelecionados,
        salvar: save,
      );
      if (!mounted) return;
      setState(() {
        _result = result;
        _loading = false;
        _saving = false;
      });
      if (save) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Comparação salva no histórico.')),
        );
      }
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString();
        _loading = false;
        _saving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_error != null && _result == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Comparação')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 48,
                  color: Colors.redAccent,
                ),
                const SizedBox(height: 12),
                Text(_error!, textAlign: TextAlign.center),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _compare,
                  child: const Text('Tentar novamente'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final result = _result!;
    final complete = result.mercados
        .where((market) => market.carrinhoCompleto)
        .toList();
    final partial = result.mercados
        .where((market) => !market.carrinhoCompleto)
        .toList();
    final best = complete.isEmpty ? null : complete.first;

    return Scaffold(
      appBar: AppBar(title: const Text('Comparação concluída')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          Text(
            complete.isEmpty
                ? 'Comparação parcial'
                : 'Encontramos a melhor opção para sua compra.',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 18),
          if (best != null)
            _BestMarketCard(
              market: best,
              savings: result.resumo.economiaPotencial,
            ),
          if (result.resumo.itensDesatualizadosTotal > 0)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  '${result.resumo.itensDesatualizadosTotal} referência(s) de preço ultrapassaram a janela de atualização do alpha. Confirme o preço no mercado antes da compra.',
                  style: const TextStyle(color: Colors.brown),
                ),
              ),
            ),
          if (complete.isEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Text(
                'Nenhum dos supermercados selecionados possui todos os produtos. Os resultados abaixo são parciais e não devem ser comparados apenas pelo total.',
              ),
            ),
          const SizedBox(height: 24),
          Text(
            'Mercados completos (${complete.length})',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          if (complete.isEmpty)
            const Text('Nenhuma cesta completa encontrada.')
          else
            ...complete.map((market) => _MarketCard(market: market)),
          if (partial.isNotEmpty) ...[
            const SizedBox(height: 24),
            Text(
              'Comparações parciais (${partial.length})',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
              'Itens faltantes ficam explícitos para não produzir um ranking enganoso.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 8),
            ...partial.map((market) => _MarketCard(market: market)),
          ],
          const SizedBox(height: 24),
          if (best != null)
            SizedBox(
              height: 54,
              child: ElevatedButton.icon(
                onPressed: _saving || result.resumo.salvo
                    ? null
                    : () => _compare(save: true),
                icon: Icon(
                  result.resumo.salvo
                      ? Icons.check_circle
                      : Icons.bookmark_add_outlined,
                ),
                label: Text(
                  result.resumo.salvo
                      ? 'Comparação salva'
                      : _saving
                      ? 'Salvando...'
                      : 'Salvar comparação',
                ),
              ),
            ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                _error!,
                style: const TextStyle(color: Colors.redAccent),
                textAlign: TextAlign.center,
              ),
            ),
        ],
      ),
    );
  }
}

class _BestMarketCard extends StatelessWidget {
  final MercadoComparacaoDTO market;
  final double savings;
  const _BestMarketCard({required this.market, required this.savings});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: AppColors.primary,
      borderRadius: BorderRadius.circular(24),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'MAIS BARATO',
          style: TextStyle(
            color: Colors.white70,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          market.nome,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 26,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Total: R\$ ${market.total.toStringAsFixed(2)} · Economia estimada: R\$ ${savings.toStringAsFixed(2)}',
          style: const TextStyle(color: Colors.white),
        ),
        if (market.totalFidelidade < market.total)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(
              'Com fidelidade: R\$ ${market.totalFidelidade.toStringAsFixed(2)}',
              style: const TextStyle(color: Colors.white70),
            ),
          ),
      ],
    ),
  );
}

class _MarketCard extends StatelessWidget {
  final MercadoComparacaoDTO market;
  const _MarketCard({required this.market});
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 10),
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  market.nome,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 17,
                  ),
                ),
              ),
              Text(
                'R\$ ${market.total.toStringAsFixed(2)}',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: market.carrinhoCompleto
                      ? AppColors.primary
                      : Colors.orange,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '${market.itensEncontrados}/${market.totalItens} produtos encontrados',
          ),
          if (market.totalFidelidade < market.total)
            Text(
              'Fidelidade: R\$ ${market.totalFidelidade.toStringAsFixed(2)}',
              style: const TextStyle(color: AppColors.primary),
            ),
          if (market.itensDesatualizados > 0)
            Text(
              '${market.itensDesatualizados} preço(s) desatualizado(s)',
              style: const TextStyle(color: Colors.amber),
            ),
          if (market.faltando.isNotEmpty) ...[
            const SizedBox(height: 8),
            ...market.faltando
                .take(3)
                .map(
                  (item) => Text(
                    '• ${item['nomeProduto'] ?? 'Produto'} sem preço',
                    style: const TextStyle(color: Colors.orange),
                  ),
                ),
            if (market.faltando.length > 3)
              Text(
                '+ ${market.faltando.length - 3} item(ns) faltando',
                style: const TextStyle(color: Colors.orange),
              ),
          ],
        ],
      ),
    ),
  );
}
