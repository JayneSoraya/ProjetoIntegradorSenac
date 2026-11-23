import 'package:flutter/material.dart';

import '../core/format/formatadores.dart';
import '../core/network/mensagem_erro.dart';
import '../models/historico_preco.dart';
import '../services/historico_service.dart';
import '../theme/app_theme.dart';
import '../widgets/estado_tela.dart';

/// Preço atual de um produto em cada supermercado aprovado e as compras da própria pessoa.
class HistoricoPrecoScreen extends StatefulWidget {
  final int idProduto;
  final String nomeProduto;

  const HistoricoPrecoScreen({
    super.key,
    required this.idProduto,
    required this.nomeProduto,
  });

  @override
  State<HistoricoPrecoScreen> createState() => _HistoricoPrecoScreenState();
}

class _HistoricoPrecoScreenState extends State<HistoricoPrecoScreen> {
  HistoricoPrecoProduto? _dados;
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
      final dados = await HistoricoService.precosDoProduto(widget.idProduto);
      if (!mounted) return;
      setState(() {
        _dados = dados;
        _carregando = false;
      });
    } catch (erro) {
      if (!mounted) return;
      setState(() {
        _erro = mensagemDeErro(
          erro,
          padrao:
              'Não foi possível carregar os preços. Verifique sua conexão e tente novamente.',
        );
        _carregando = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.nomeProduto,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 16),
        ),
      ),
      body: _corpo(),
    );
  }

  Widget _corpo() {
    if (_carregando) {
      return const Center(child: CircularProgressIndicator());
    }
    final dados = _dados;
    if (_erro != null || dados == null) {
      return EstadoErro(
        mensagem: _erro ?? 'Preços indisponíveis.',
        onTentarNovamente: _carregar,
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _carregar,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          const _Titulo('Preço atual por mercado'),
          const SizedBox(height: 12),
          if (dados.precosAtuais.isEmpty)
            const _Aviso(
              'Nenhum supermercado aprovado informou preço para este produto ainda.',
            )
          else
            ...dados.precosAtuais.asMap().entries.map(
              (entrada) => _PrecoTile(
                preco: entrada.value,
                maisBarato: entrada.key == 0,
              ),
            ),
          const SizedBox(height: 24),
          const _Titulo('Suas compras deste produto'),
          const SizedBox(height: 12),
          if (dados.minhasCompras.isEmpty)
            const _Aviso(
              'Você ainda não importou nenhuma nota com este produto.',
            )
          else
            ...dados.minhasCompras.asMap().entries.map(
              (entrada) => _CompraTile(
                compra: entrada.value,
                anterior: entrada.key + 1 < dados.minhasCompras.length
                    ? dados.minhasCompras[entrada.key + 1]
                    : null,
              ),
            ),
        ],
      ),
    );
  }
}

class _Titulo extends StatelessWidget {
  final String texto;
  const _Titulo(this.texto);

  @override
  Widget build(BuildContext context) => Text(
    texto,
    style: const TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: 16,
      color: AppColors.primary,
    ),
  );
}

class _Aviso extends StatelessWidget {
  final String texto;
  const _Aviso(this.texto);

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.grey.shade100,
      borderRadius: BorderRadius.circular(12),
    ),
    child: Text(
      texto,
      textAlign: TextAlign.center,
      style: const TextStyle(color: Colors.grey, fontSize: 13),
    ),
  );
}

class _PrecoTile extends StatelessWidget {
  final PrecoMercado preco;
  final bool maisBarato;
  const _PrecoTile({required this.preco, required this.maisBarato});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: maisBarato
            ? AppColors.secondary.withValues(alpha: 0.08)
            : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: maisBarato ? AppColors.secondary : Colors.grey.shade200,
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
                  preco.supermercado,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                if (preco.dataAtualizacao != null)
                  Text(
                    'Atualizado em ${formatarData(preco.dataAtualizacao)}',
                    style: const TextStyle(color: Colors.grey, fontSize: 11),
                  ),
                if (preco.precoFidelidade != null &&
                    preco.precoFidelidade! < preco.precoAtual)
                  Text(
                    'Fidelidade: ${formatarMoeda(preco.precoFidelidade!)}',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontSize: 11,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (maisBarato)
                Container(
                  margin: const EdgeInsets.only(bottom: 4),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'Mais barato',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              Text(
                formatarMoeda(preco.precoAtual),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
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

class _CompraTile extends StatelessWidget {
  final CompraDoProduto compra;
  final CompraDoProduto? anterior;
  const _CompraTile({required this.compra, required this.anterior});

  @override
  Widget build(BuildContext context) {
    final ref = anterior?.precoUnitario;
    final subiu = ref != null && compra.precoUnitario > ref;
    final desceu = ref != null && compra.precoUnitario < ref;
    final cor = desceu
        ? Colors.green
        : subiu
        ? Colors.red
        : Colors.grey;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(shape: BoxShape.circle, color: cor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  compra.supermercado,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  formatarData(compra.dataCompra),
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            formatarMoeda(compra.precoUnitario),
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          SizedBox(
            width: 22,
            child: desceu
                ? const Icon(
                    Icons.arrow_downward,
                    color: Colors.green,
                    size: 16,
                  )
                : subiu
                ? const Icon(Icons.arrow_upward, color: Colors.red, size: 16)
                : null,
          ),
        ],
      ),
    );
  }
}
