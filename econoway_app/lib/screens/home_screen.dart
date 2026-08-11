import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../controller/carrinho_controller.dart';
import '../widgets/cart_scope.dart';
import '../services/economia_service.dart';
import '../services/carrinho_service.dart';
import 'carrinho_screen.dart';
import 'produtos_screen.dart';
import 'scan_nota_screen.dart';
import 'historico_screen.dart';
import 'supermercados_screen.dart';
import 'perfil_screen.dart';
import '../widgets/home_quick_action_card.dart';

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
  late CarrinhoController _cart;
  bool _cartRestored = false;

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

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _cart = CartScope.of(context);
    if (!_cartRestored) {
      _cartRestored = true;
      _restaurarCarrinho();
    }
  }

  Future<void> _restaurarCarrinho() async {
    try {
      final itens = await CarrinhoService.carregar();
      _cart.restaurar(itens);
      if (mounted) setState(() {});
    } catch (_) {
      // O carrinho local continua utilizável se a sincronização estiver indisponível.
    }
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
    final quantidade = _cart.quantidadeTotal;

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
                  'EconoWay',
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
                              color: AppColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.2),
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

                        IconButton(
                          tooltip: 'Perfil',
                          icon: const Icon(
                            Icons.person_outline,
                            color: AppColors.primary,
                          ),
                          onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const PerfilScreen(),
                            ),
                          ),
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
                      color: AppColors.primary.withValues(alpha: 0.08),
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

                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.82,
                  children: [
                    HomeQuickActionCard(
                      icon: Icons.local_mall_outlined,
                      title: 'Comparar preços',
                      subtitle: 'Monte sua cesta',
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ProdutosScreen(),
                        ),
                      ),
                    ),
                    HomeQuickActionCard(
                      icon: Icons.map_outlined,
                      title: 'Supermercados',
                      subtitle: 'Favoritos e disponíveis',
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const SupermercadosScreen(),
                        ),
                      ),
                    ),

                    HomeQuickActionCard(
                      icon: Icons.qr_code_scanner,
                      title: 'Escanear Nota',
                      subtitle: '+100 por NFC-e válida e inédita',
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
                    HomeQuickActionCard(
                      icon: Icons.history,
                      title: 'Histórico',
                      subtitle: 'Suas economias',
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const HistoricoScreen(),
                        ),
                      ),
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
            color: AppColors.primary.withValues(alpha: 0.3),
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
            builder: (_, _) => Text(
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

  // ── Primeira vez sem histórico de comparação ───────────────
  Widget _buildCardPrimeiraVez() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.shopping_basket_outlined,
            size: 36,
            color: AppColors.primary,
          ),
          const SizedBox(height: 12),
          const Text(
            'Monte sua primeira cesta',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Adicione produtos e compare a mesma compra entre supermercados.',
            style: TextStyle(color: Colors.grey, fontSize: 13),
          ),
          const SizedBox(height: 14),
          ElevatedButton.icon(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ProdutosScreen()),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: const Icon(Icons.search, size: 18),
            label: const Text('Buscar produtos'),
          ),
        ],
      ),
    );
  }

  // ── Linha: economia do mês + EconoCoins ───────────────────
  Widget _buildLinhaDados() {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.secondary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.secondary.withValues(alpha: 0.2),
              ),
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
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.primary.withValues(alpha: 0.15),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'EconoCoins',
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(
                      Icons.bolt,
                      color: AppColors.secondary,
                      size: 18,
                    ),
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
                Text(
                  '${_resumo!.totalNotasValidas} NFC-e ${_resumo!.totalNotasValidas == 1 ? 'válida' : 'válidas'}',
                  style: const TextStyle(color: Colors.grey, fontSize: 11),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ── Progresso de contribuição do mapa de preços ───────────
  Widget _buildProgressoMapa() {
    final resumo = _resumo!;

    final int notasValidas = resumo.totalNotasValidas;
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
          color: AppColors.primary.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: AppColors.primary.withValues(alpha: 0.2),
            width: 1.5,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.map_outlined,
                        color: AppColors.primary,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Mapa de preços',
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

            Row(
              children: [
                Expanded(
                  child: Text(
                    notasValidas == 0
                        ? 'Escaneie uma NFC-e válida para contribuir com preços reais do mapa.'
                        : 'Você já contribuiu com $notasValidas ${notasValidas == 1 ? 'nota válida' : 'notas válidas'}. Comparações nunca ficam bloqueadas por gamificação.',
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                ),
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

  // ── Card das ações principais ─────────────────────────────
}
