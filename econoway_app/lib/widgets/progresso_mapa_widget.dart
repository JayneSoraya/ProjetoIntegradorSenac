import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../screens/scan_nota_screen.dart';
//import '../helpers/nivel_helper.dart';

class ProgressoMapaWidget extends StatefulWidget {
  /// Se true, recarrega os dados automaticamente ao montar
  final bool autoCarregar;

  /// Callback chamado quando o usuário toca no widget
  final VoidCallback? onTap;

  const ProgressoMapaWidget({super.key, this.autoCarregar = true, this.onTap});

  @override
  State<ProgressoMapaWidget> createState() => _ProgressoMapaWidgetState();
}

class _ProgressoMapaWidgetState extends State<ProgressoMapaWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _barraAnim;

  double _progresso = 0;
  int _scansFeitos = 0;
  int _metaScans = 10;
  int _produtosComPreco = 0;
  int _metaProdutos = 50;
  bool _carregando = true;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );
    _barraAnim = Tween<double>(begin: 0, end: 0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
    if (widget.autoCarregar) _carregar();
  }

  Future<void> _carregar() async {
    try {
      final token = await AuthService.getToken();
      final response = await http
          .get(
            Uri.parse('http://192.168.1.11:3333/api/progresso'),
            headers: {'Authorization': 'Bearer $token'},
          )
          .timeout(const Duration(seconds: 8));

      if (response.statusCode == 200 && mounted) {
        final data = jsonDecode(response.body);
        final progressoReal =
            (data['progresso'] as num?)?.toDouble().clamp(0.0, 1.0) ?? 0.0;
        setState(() {
          _progresso = progressoReal;
          _scansFeitos = data['scans_feitos'] ?? 0;
          _metaScans = data['meta_scans'] ?? 10;
          _produtosComPreco = data['produtos_com_preco'] ?? 0;
          _metaProdutos = data['meta_produtos'] ?? 50;
          _carregando = false;
        });

        // Anima a barra para o valor real
        _barraAnim = Tween<double>(begin: 0, end: progressoReal).animate(
          CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
        );
        _animController.forward(from: 0);
      }
    } catch (e) {
      debugPrint('ERRO PROGRESSO: $e');

      if (mounted) {
        setState(() {
          _carregando = false;
        });
      }
    }
  }

  /// Recarrega os dados externamente (ex: após escanear nota)
  Future<void> recarregar() => _carregar();

  int get _faltamScans => (_metaScans - _scansFeitos).clamp(0, _metaScans);

  bool get _completo => _progresso >= 1.0;

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_carregando) {
      return Container(
        height: 90,
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.05),
          borderRadius: BorderRadius.circular(18),
        ),
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

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.primary.withOpacity(0.2),
          width: 1.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Cabeçalho ─────────────────────────────────
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _completo
                      ? Icons.lock_open_rounded
                      : Icons.lock_outline_rounded,
                  color: AppColors.primary,
                  size: 16,
                ),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Mapa de preços de Araraquara',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: AppColors.primary,
                  ),
                ),
              ),
              // Badge de porcentagem
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${(_progresso * 100).toInt()}% completo',
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

          // ── Barra animada ──────────────────────────────
          AnimatedBuilder(
            animation: _barraAnim,
            builder: (_, __) => ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: LinearProgressIndicator(
                value: _barraAnim.value,
                minHeight: 12,
                backgroundColor: Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation(
                  _completo ? Colors.amber : AppColors.secondary,
                ),
              ),
            ),
          ),

          const SizedBox(height: 10),

          // ── Texto de tensão cognitiva ──────────────────
          Row(
            children: [
              Expanded(
                child: _completo
                    ? const Text(
                        '🎉 Você ajudou a completar o mapa de Araraquara!',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      )
                    : Text(
                        'Faltam $_faltamScans ${_faltamScans == 1 ? 'scan' : 'scans'} '
                        'para desbloquear a comparação com TODOS os mercados.',
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
              ),
              if (!_completo)
                const Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.primary,
                  size: 20,
                ),
            ],
          ),

          const SizedBox(height: 8),

          // ── Sub-info ───────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _subInfo(
                icone: Icons.qr_code_scanner,
                label: '$_scansFeitos scans feitos',
              ),
              _subInfo(
                icone: Icons.inventory_2_outlined,
                label: '$_produtosComPreco/$_metaProdutos produtos',
              ),
            ],
          ),

          const SizedBox(height: 14),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ScanNotaScreen()),
                );

                await recarregar();
              },
              icon: const Icon(Icons.qr_code_scanner),
              label: const Text('Escanear nota fiscal'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _subInfo({required IconData icone, required String label}) {
    return Row(
      children: [
        Icon(icone, size: 13, color: Colors.grey),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
      ],
    );
  }
}
