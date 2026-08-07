import 'package:econoway_app/services/auth_service.dart';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../controller/carrinho_controller.dart';
import '../services/economia_service.dart';
import 'carrinho_screen.dart';
import 'welcome_screen.dart';
import 'produtos_screen.dart';
import 'scan_nota_screen.dart';

class HomeScreen extends StatefulWidget {
  final String nomeUsuario;

  const HomeScreen({super.key, required this.nomeUsuario});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _economiaAnim;

  ResumoUsuario? _resumo;
  bool _carregando = true;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );
    _economiaAnim = const AlwaysStoppedAnimation(0);
    _carregarResumo();
  }

  Future<void> _carregarResumo() async {
    try {
      final resumo = await EconomiaService.buscarResumo();
      if (!mounted) return;

      _economiaAnim = Tween<double>(begin: 0, end: resumo.economiaPotencial)
          .animate(
            CurvedAnimation(parent: _animController, curve: Curves.easeOut),
          );

      setState(() {
        _resumo = resumo;
        _carregando = false;
      });
      _animController.forward();
    } catch (_) {
      if (!mounted) return;
      setState(() => _carregando = false);
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final quantidade = CarrinhoController().quantidadeTotal;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: _carregarResumo,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'SaveMoney',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                    letterSpacing: 0.5,
                  ),
                ),

                const SizedBox(height: 8),

                // ── Saudação + carrinho + coins + logout ──────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Olá, ${widget.nomeUsuario}!',
                      style: const TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    Row(
                      children: [
                        
                        if (!_carregando && _resumo != null)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppColors.primary.withOpacity(0.2),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.bolt,
                                  color: AppColors.secondary,
                                  size: 16,
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  '${_resumo!.econoCoins}',
                                  style: const TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),

                        // Carrinho
                        Stack(
                          children: [
                            IconButton(
                              icon: const Icon(
                                Icons.shopping_cart,
                                color: AppColors.primary,
                              ),
                              onPressed: () async {
                                await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const CarrinhoScreen(),
                                  ),
                                );
                                setState(() {});
                              },
                            ),
                            if (quantidade > 0)
                              Positioned(
                                right: 4,
                                top: 4,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: Colors.red,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  constraints: const BoxConstraints(
                                    minWidth: 18,
                                    minHeight: 18,
                                  ),
                                  child: Text(
                                    quantidade.toString(),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                          ],
                        ),

                        // Logout
                        IconButton(
                          icon: const Icon(
                            Icons.logout_rounded,
                            color: Colors.redAccent,
                          ),
                          onPressed: () async {
                            await AuthService.logout();
                            if (!mounted) return;
                            Navigator.pushAndRemoveUntil(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const WelcomeScreen(),
                              ),
                              (route) => false,
                            );
                          },
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // ── Card economia potencial 
                if (_carregando)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Center(
                      child: CircularProgressIndicator(
                        color: AppColors.primary,
                      ),
                    ),
                  )
                else if (_resumo != null && !_resumo!.semDados)
                  _buildCardEconomia()
                else
                  _buildCardPrimeiraVez(),

                const SizedBox(height: 16),

                
                if (!_carregando && _resumo != null && !_resumo!.semDados)
                  _buildLinhaDados(),

                if (!_carregando && _resumo != null && !_resumo!.semDados)
                  const SizedBox(height: 16),

                // ── Progresso mapa ────────────────────────────
                if (!_carregando && _resumo != null) _buildProgressoMapa(),

                const SizedBox(height: 24),

              
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColors.primary.withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.co2_rounded,
                        size: 50,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Emissões de CO₂',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Histórico de gases poluentes reduzidos com base nas distâncias percorridas.',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

          
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  children: [
                    _buildDashboardCard(
                      context,
                      icon: Icons.local_mall_outlined,
                      title: 'Listas de Compras',
                      subtitle: 'Avaliação de menor preço',
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ProdutosScreen(),
                        ),
                      ),
                    ),
                    _buildDashboardCard(
                      context,
                      icon: Icons.map_outlined,
                      title: 'Rotas de Viagens',
                      subtitle: 'Distâncias calculadas',
                    ),
                    
                    _buildDashboardCard(
                      context,
                      icon: Icons.qr_code_scanner,
                      title: 'Escanear Nota',
                      subtitle: '+100 coins por scan',
                      destaque: true,
                      onTap: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ScanNotaScreen(),
                          ),
                        );
                        _carregarResumo(); 
                      },
                    ),
                    _buildDashboardCard(
                      context,
                      icon: Icons.history,
                      title: 'Histórico',
                      subtitle: 'Suas economias',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Card economia potencial ────────────────────────────────
  Widget _buildCardEconomia() {
    final mercado = _resumo!.mercadoMaisBarato ?? 'mercado mais barato';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'VOCÊ PODE ECONOMIZAR',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          AnimatedBuilder(
            animation: _economiaAnim,
            builder: (_, __) => Text(
              'R\$ ${_economiaAnim.value.toStringAsFixed(2)}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 42,
                fontWeight: FontWeight.bold,
                height: 1,
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'comprando no $mercado.',
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ProdutosScreen()),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.secondary,
                foregroundColor: AppColors.backgroundDark,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Ver onde economizar →',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Primeira vez sem dados ─────────────────────────────────
  Widget _buildCardPrimeiraVez() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.qr_code_scanner, size: 36, color: AppColors.primary),
          const SizedBox(height: 12),
          const Text(
            'Comece escaneando sua primeira nota',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Descubra quanto você pode economizar na próxima compra.',
            style: TextStyle(color: Colors.grey, fontSize: 13),
          ),
          const SizedBox(height: 14),
          ElevatedButton.icon(
            onPressed: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ScanNotaScreen()),
              );
              _carregarResumo();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: const Icon(Icons.qr_code_scanner, size: 18),
            label: const Text('Escanear nota fiscal'),
          ),
        ],
      ),
    );
  }

  // ── Linha: economia do mês + EconoCoins ───────────────────
  Widget _buildLinhaDados() {
    final scans = _resumo!.totalComparacoes;
    String nivel = scans >= 21
        ? 'Ouro'
        : scans >= 6
        ? 'Prata'
        : 'Bronze';
    Color corNivel = scans >= 21
        ? Colors.amber
        : scans >= 6
        ? Colors.blueGrey.shade400
        : const Color(0xFFCD7F32);

    return Row(
      children: [
        // Economia do mês
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.secondary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.secondary.withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Este mês',
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
                const SizedBox(height: 4),
                Text(
                  'R\$ ${_resumo!.economiaMes.toStringAsFixed(2)}',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Text(
                  'economizados',
                  style: TextStyle(color: Colors.grey, fontSize: 11),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        // EconoCoins + nível
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.06),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.primary.withOpacity(0.15)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'EconoWayer $nivel',
                  style: TextStyle(
                    color: corNivel,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.bolt, color: AppColors.secondary, size: 18),
                    Text(
                      ' ${_resumo!.econoCoins}',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Text(
                  'EconoCoins',
                  style: TextStyle(color: Colors.grey, fontSize: 11),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ── Progresso mapa (Princípio 5 — Efeito Zeigarnik) ────────
  Widget _buildProgressoMapa() {
    final resumo = _resumo!;

    // Cálculo de metas / scans restantes para desbloqueio
    const int metaScans = 10;
    final int scansAtuais = resumo.totalComparacoes;
    final int faltamScans = (metaScans - scansAtuais).clamp(0, metaScans);
    final double porcentagem = resumo.progressoMapa.clamp(0.0, 1.0);

    return InkWell(
      onTap: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ScanNotaScreen()),
        );
        _carregarResumo();
      },
      borderRadius: BorderRadius.circular(18),
      child: Container(
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
            // Cabeçalho com ícone de cadeado/progresso
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        porcentagem >= 1.0
                            ? Icons.lock_open_rounded
                            : Icons.lock_outline_rounded,
                        color: AppColors.primary,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Mapa de Araraquara',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${(porcentagem * 100).toInt()}%',
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

            // Barra de Progresso Animada
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: TweenAnimationBuilder<double>(
                duration: const Duration(milliseconds: 1200),
                curve: Curves.easeOutCubic,
                tween: Tween<double>(begin: 0, end: porcentagem),
                builder: (context, value, _) => LinearProgressIndicator(
                  value: value,
                  minHeight: 10,
                  backgroundColor: Colors.grey.shade200,
                  valueColor: const AlwaysStoppedAnimation(AppColors.secondary),
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Texto de Tensão Cognitiva / Gatilho Zeigarnik
            Row(
              children: [
                Expanded(
                  child: Text(
                    faltamScans > 0
                        ? 'Faltam $faltamScans ${faltamScans == 1 ? 'scan' : 'scans'} para desbloquear a comparação com TODOS os mercados.'
                        : '🎉 Você ajudou a completar o mapa de preços da cidade!',
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: faltamScans > 0
                          ? Colors.black87
                          : AppColors.primary,
                    ),
                  ),
                ),
                if (faltamScans > 0)
                  const Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.primary,
                    size: 20,
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── Card do grid (original + parâmetro destaque) ───────────
  Widget _buildDashboardCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    bool destaque = false,
    VoidCallback? onTap,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: destaque
              ? AppColors.secondary.withOpacity(0.1)
              : Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: destaque
                ? AppColors.secondary.withOpacity(0.3)
                : AppColors.secondary.withOpacity(0.1),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: destaque ? AppColors.secondary : AppColors.secondary,
              size: 32,
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                color: destaque ? AppColors.primary : Colors.grey,
                fontSize: 12,
                fontWeight: destaque ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
