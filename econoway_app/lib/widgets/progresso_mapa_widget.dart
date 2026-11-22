import 'package:flutter/material.dart';

import '../core/network/mensagem_erro.dart';
import '../helpers/nivel_helper.dart';
import '../models/progresso_contribuicao.dart';
import '../services/historico_service.dart';
import '../theme/app_theme.dart';

/// Card da home com o progresso de contribuição da pessoa usuária ao mapa de preços.
/// O progresso é informativo: nunca bloqueia comparações.
class ProgressoMapaWidget extends StatefulWidget {
  /// Abre o fluxo de escaneamento de nota. O widget recarrega ao retornar.
  final Future<void> Function()? onEscanear;

  /// Altere o valor para forçar uma nova consulta (ex.: puxar para atualizar).
  final int versao;

  /// Permite injetar o carregamento (testes).
  final Future<ProgressoContribuicao> Function()? carregador;

  const ProgressoMapaWidget({
    super.key,
    this.onEscanear,
    this.versao = 0,
    this.carregador,
  });

  @override
  State<ProgressoMapaWidget> createState() => _ProgressoMapaWidgetState();
}

class _ProgressoMapaWidgetState extends State<ProgressoMapaWidget> {
  ProgressoContribuicao? _progresso;
  bool _carregando = true;
  String? _erro;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  @override
  void didUpdateWidget(covariant ProgressoMapaWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.versao != widget.versao) _carregar();
  }

  Future<void> _carregar() async {
    setState(() {
      _carregando = _progresso == null;
      _erro = null;
    });
    try {
      final carregar = widget.carregador ?? HistoricoService.buscarProgresso;
      final progresso = await carregar();
      if (!mounted) return;
      setState(() {
        _progresso = progresso;
        _carregando = false;
      });
    } catch (erro) {
      if (!mounted) return;
      setState(() {
        _erro = mensagemDeErro(
          erro,
          padrao: 'Não foi possível carregar seu progresso agora.',
        );
        _carregando = false;
      });
    }
  }

  Future<void> _escanear() async {
    await widget.onEscanear?.call();
    if (mounted) _carregar();
  }

  BoxDecoration get _moldura => BoxDecoration(
    color: AppColors.primary.withValues(alpha: 0.05),
    borderRadius: BorderRadius.circular(18),
    border: Border.all(
      color: AppColors.primary.withValues(alpha: 0.2),
      width: 1.5,
    ),
  );

  @override
  Widget build(BuildContext context) {
    if (_carregando) {
      return Container(
        height: 90,
        decoration: _moldura,
        child: const Center(
          child: SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 2,
            ),
          ),
        ),
      );
    }

    final progresso = _progresso;
    if (progresso == null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: _moldura,
        child: Row(
          children: [
            const Icon(Icons.cloud_off_outlined, color: Colors.grey),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                _erro ?? 'Progresso indisponível.',
                style: const TextStyle(fontSize: 13),
              ),
            ),
            TextButton(onPressed: _carregar, child: const Text('Tentar')),
          ],
        ),
      );
    }

    final nivel = NivelEconoWayer.obterNivel(progresso.notasImportadas);
    final faltamNivel = NivelEconoWayer.notasParaProximoNivel(
      progresso.notasImportadas,
    );
    final percentual = (progresso.progresso * 100).round();

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _moldura,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.map_outlined,
                  color: AppColors.primary,
                  size: 18,
                ),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Mapa de preços',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppColors.primary,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$percentual%',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: TweenAnimationBuilder<double>(
              duration: const Duration(milliseconds: 1000),
              curve: Curves.easeOutCubic,
              tween: Tween<double>(begin: 0, end: progresso.progresso),
              builder: (_, valor, _) => LinearProgressIndicator(
                value: valor,
                minHeight: 10,
                backgroundColor: Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation(
                  progresso.concluido ? nivel.cor : AppColors.secondary,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            progresso.mensagem,
            style: const TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 16,
            runSpacing: 6,
            children: [
              _Info(
                icone: Icons.qr_code_scanner,
                texto:
                    '${progresso.notasImportadas}/${progresso.metaNotas} notas',
              ),
              _Info(
                icone: Icons.inventory_2_outlined,
                texto:
                    '${progresso.produtosComPreco}/${progresso.metaProdutos} produtos com preço',
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(nivel.icone, color: nivel.cor, size: 18),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  faltamNivel == 0
                      ? '${nivel.nome} · nível máximo'
                      : '${nivel.nome} · faltam $faltamNivel ${faltamNivel == 1 ? 'nota' : 'notas'} para o próximo nível',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: nivel.cor,
                  ),
                ),
              ),
            ],
          ),
          if (widget.onEscanear != null) ...[
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _escanear,
                icon: const Icon(Icons.qr_code_scanner),
                label: const Text('Escanear nota fiscal'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _Info extends StatelessWidget {
  final IconData icone;
  final String texto;
  const _Info({required this.icone, required this.texto});

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icone, size: 14, color: Colors.grey),
      const SizedBox(width: 4),
      Flexible(
        child: Text(
          texto,
          style: const TextStyle(color: Colors.grey, fontSize: 11.5),
        ),
      ),
    ],
  );
}
