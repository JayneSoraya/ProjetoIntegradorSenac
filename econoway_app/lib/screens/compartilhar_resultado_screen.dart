import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/format/formatadores.dart';
import '../theme/app_theme.dart';

/// Resumo compartilhável do resultado de uma comparação.
/// A economia é estimada contra a média dos mercados completos mais caros.
class CompartilharResultadoScreen extends StatelessWidget {
  final String mercadoEscolhido;
  final double valorEscolhido;
  final double valorReferencia;
  final double economia;

  const CompartilharResultadoScreen({
    super.key,
    required this.mercadoEscolhido,
    required this.valorEscolhido,
    required this.valorReferencia,
    required this.economia,
  });

  double get _percentual =>
      valorReferencia > 0 ? (economia / valorReferencia) * 100 : 0;

  String get textoCompartilhavel =>
      'Minha cesta ficou em ${formatarMoeda(valorEscolhido)} no $mercadoEscolhido.\n'
      'Economia estimada de ${formatarMoeda(economia)} '
      '(${_percentual.toStringAsFixed(1).replaceAll('.', ',')}%) '
      'em relação à média dos mercados mais caros.\n\n'
      'Compare preços no EconoWay e descubra onde pagar menos.\n'
      '#EconoWay #Economia';

  Future<void> _copiar(BuildContext context) async {
    await Clipboard.setData(ClipboardData(text: textoCompartilhavel));
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Texto copiado para a área de transferência.'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Compartilhar resultado')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(
                          Icons.savings_outlined,
                          color: Colors.white70,
                          size: 18,
                        ),
                        SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'ECONOWAY · RESULTADO DA COMPARAÇÃO',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Economia estimada',
                      style: TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Text(
                        formatarMoeda(economia),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 44,
                          fontWeight: FontWeight.bold,
                          height: 1,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          _linha(
                            mercadoEscolhido,
                            formatarMoeda(valorEscolhido),
                            destaque: true,
                          ),
                          const Divider(color: Colors.white24, height: 20),
                          _linha(
                            'Média dos mais caros',
                            formatarMoeda(valorReferencia),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              if (valorReferencia > 0)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: AppColors.secondary.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.trending_down,
                        color: AppColors.primary,
                        size: 36,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${_percentual.toStringAsFixed(1).replaceAll('.', ',')}% mais barato',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'em relação à média dos mercados completos mais caros.',
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 24),
              const Text(
                'Texto para compartilhar',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(textoCompartilhavel),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => _copiar(context),
                icon: const Icon(Icons.content_copy),
                label: const Text('Copiar texto'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _linha(String rotulo, String valor, {bool destaque = false}) {
    return Row(
      children: [
        if (destaque)
          const Padding(
            padding: EdgeInsets.only(right: 6),
            child: Icon(
              Icons.check_circle,
              color: AppColors.secondary,
              size: 16,
            ),
          ),
        Expanded(
          child: Text(
            rotulo,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.white,
              fontWeight: destaque ? FontWeight.bold : FontWeight.normal,
              fontSize: destaque ? 15 : 13,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          valor,
          style: TextStyle(
            color: destaque ? AppColors.secondary : Colors.white70,
            fontWeight: destaque ? FontWeight.bold : FontWeight.normal,
            fontSize: destaque ? 16 : 13,
          ),
        ),
      ],
    );
  }
}
