import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import 'admin_mercados_screen.dart';
import 'admin_usuarios_screen.dart';
import 'admin_produtos_screen.dart';
import 'welcome_screen.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Administração'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            onPressed: () async {
              await AuthService.logout();
              if (!context.mounted) return;
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Painel Admin',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Gerencie SaveMoney',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: [
                _buildAdminCard(
                  context,
                  icon: Icons.people_outline,
                  titulo: 'Usuários',
                  subtitulo: 'Ver e gerenciar contas',
                  onTap: () => Navigator.push(context,
                      MaterialPageRoute(
                          builder: (_) => const AdminUsuariosScreen())),
                ),
                _buildAdminCard(
                  context,
                  icon: Icons.store_outlined,
                  titulo: 'Mercados',
                  subtitulo: 'RF21 — Cadastro',
                  onTap: () => Navigator.push(context,
                      MaterialPageRoute(
                          builder: (_) => const AdminMercadosScreen())),
                ),
                _buildAdminCard(
                  context,
                  icon: Icons.inventory_2_outlined,
                  titulo: 'Produtos',
                  subtitulo: 'Corrigir categorias',
                  onTap: () => Navigator.push(context,
                      MaterialPageRoute(
                          builder: (_) => const AdminProdutosScreen())),
                ),
                _buildAdminCard(
                  context,
                  icon: Icons.receipt_long_outlined,
                  titulo: 'Notas',
                  subtitulo: 'Em breve',
                  onTap: null,
                  desabilitado: true,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdminCard(
    BuildContext context, {
    required IconData icon,
    required String titulo,
    required String subtitulo,
    VoidCallback? onTap,
    bool desabilitado = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: desabilitado
              ? Colors.grey.shade100
              : AppColors.primary.withOpacity(0.06),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: desabilitado
                ? Colors.grey.shade200
                : AppColors.primary.withOpacity(0.2),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 32,
              color: desabilitado ? Colors.grey : AppColors.primary,
            ),
            const SizedBox(height: 12),
            Text(
              titulo,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: desabilitado ? Colors.grey : null,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitulo,
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}