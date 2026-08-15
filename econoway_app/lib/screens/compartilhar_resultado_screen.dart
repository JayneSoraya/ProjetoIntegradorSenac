import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import '../theme/app_theme.dart';
import 'package:flutter/services.dart';

class CompartilharResultadoScreen extends StatelessWidget {
  final String mercadoEscolhido;
  final String mercadoCaro;
  final double valorEscolhido;
  final double valorCaro;
  final double economia;

  const CompartilharResultadoScreen({
    super.key,
    required this.mercadoEscolhido,
    required this.mercadoCaro,
    required this.valorEscolhido,
    required this.valorCaro,
    required this.economia,
  });

  String get _textoPadrao =>
      'Comprei esse carrinho por R\$ ${valorEscolhido.toStringAsFixed(2)} '
      'no $mercadoEscolhido.\n'
      'No $mercadoCaro custaria R\$ ${valorCaro.toStringAsFixed(2)}.\n'
      'Economizei R\$ ${economia.toStringAsFixed(2)} 😎\n\n'
      'Use o EconoWay e descubra onde você paga menos! 🛒\n'
      '#EconoWay #Economia #Araraquara';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Compartilhar resultado'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Card de resultado (preview do que vai compartilhar)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, Color(0xFF0D6B57)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.savings_outlined,
                        color: Colors.white70,
                        size: 18,
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        'ECONOWAY · RESULTADO DA COMPRA',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Economia em destaque
                  const Text(
                    'Economizei',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  Text(
                    'R\$ ${economia.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      height: 1,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Comparação
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        _linhaComparacao(
                          mercadoEscolhido,
                          valorEscolhido,
                          destaque: true,
                        ),
                        const Divider(color: Colors.white24, height: 20),
                        _linhaComparacao(mercadoCaro, valorCaro),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),
                  const Text(
                    '#EconoWay #Economia #Araraquara',
                    style: TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            const SizedBox(height: 24),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.green.shade200),
              ),
              child: Column(
                children: [
                  const Icon(Icons.trending_up, color: Colors.green, size: 40),

                  const SizedBox(height: 10),

                  Text(
                    'Você economizou '
                    '${((economia / valorCaro) * 100).toStringAsFixed(1)}%',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),

                  const SizedBox(height: 6),

                  const Text(
                    'em comparação ao mercado mais caro.',
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ── Frase de conversão (neuromarketing) ──────────
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.secondary.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.secondary.withOpacity(0.3)),
              ),
              child: const Text(
                '"Moradores de Araraquara já economizaram R\$ 1.240 '
                'esse mês escaneando suas notas. Você ainda não."',
                style: TextStyle(
                  color: AppColors.primary,
                  fontStyle: FontStyle.italic,
                  fontSize: 14,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
            ),

            const SizedBox(height: 24),
            const Text(
              'Compartilhar via',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 12),

            // ── Botões de compartilhamento ──────────────────
            _botaoCompartilhar(
              icone: Icons.content_copy,
              label: 'Copiar texto',
              cor: Colors.purple,
              onTap: () async {
                await Clipboard.setData(ClipboardData(text: _textoPadrao));

                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        'Texto copiado para a área de transferência!',
                      ),
                    ),
                  );
                }
              },
            ),
            const SizedBox(height: 10),
            _botaoCompartilhar(
              icone: Icons.camera_alt_outlined,
              label: 'Copiar texto para Stories',
              cor: Colors.purple,
              onTap: () async {
                await Share.share(_textoPadrao);
              },
            ),
            const SizedBox(height: 10),
            _botaoCompartilhar(
              icone: Icons.message_outlined,
              label: 'Enviar por WhatsApp / Telegram',
              cor: Colors.green.shade700,
              onTap: () => Share.share(_textoPadrao),
            ),
          ],
        ),
      ),
    );
  }

  Widget _linhaComparacao(
    String mercado,
    double valor, {
    bool destaque = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
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
            Text(
              mercado,
              style: TextStyle(
                color: Colors.white,
                fontWeight: destaque ? FontWeight.bold : FontWeight.normal,
                fontSize: destaque ? 15 : 13,
              ),
            ),
          ],
        ),
        Text(
          'R\$ ${valor.toStringAsFixed(2)}',
          style: TextStyle(
            color: destaque ? AppColors.secondary : Colors.white60,
            fontWeight: destaque ? FontWeight.bold : FontWeight.normal,
            fontSize: destaque ? 16 : 13,
            decoration: destaque ? null : TextDecoration.lineThrough,
          ),
        ),
      ],
    );
  }

  Widget _botaoCompartilhar({
    required IconData icone,
    required String label,
    required Color cor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: cor.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: cor.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Icon(icone, color: cor, size: 22),
            const SizedBox(width: 12),
            Text(
              label,
              style: TextStyle(color: cor, fontWeight: FontWeight.w600),
            ),
            const Spacer(),
            Icon(Icons.chevron_right, color: cor.withOpacity(0.5)),
          ],
        ),
      ),
    );
  }
}
