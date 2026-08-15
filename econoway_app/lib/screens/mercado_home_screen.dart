import 'package:flutter/material.dart';
import 'package:econoway_app/services/auth_service.dart';
import '../theme/app_theme.dart';
import 'welcome_screen.dart';
import 'admin_mercado_cadastro_screen.dart';

class MercadoHomeScreen extends StatelessWidget {
  const MercadoHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Painel do Mercado'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.redAccent),
            tooltip: 'Sair',
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card principal
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          '🏪 Tonin',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),

                      IconButton(
                        icon: const Icon(Icons.edit),
                        tooltip: 'Editar dados',
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const AdminMercadoCadastroScreen(),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  Chip(
                    avatar: const Icon(
                      Icons.verified,

                      color: Colors.green,

                      size: 18,
                    ),

                    label: const Text('Mercado Verificado'),

                    backgroundColor: Colors.green.shade50,
                  ),
                  const Divider(),

                  _info('📦 Produtos cadastrados', '532'),
                  _info('🕒 Última atualização', '09/08/2026'),
                  _info('⭐ Avaliação média', '4.7'),
                  _info('📊 Comparações', '1.253'),
                ],
              ),
            ),

            const SizedBox(height: 24),

            const Text(
              'Gerenciamento',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 16),

            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.2,
              children: [
                _menuCard(icon: Icons.inventory_2_outlined, title: 'Produtos'),

                _menuCard(icon: Icons.attach_money, title: 'Preços'),

                _menuCard(icon: Icons.star_outline, title: 'Avaliações'),

                _menuCard(icon: Icons.bar_chart, title: 'Estatísticas'),

                _menuCard(icon: Icons.upload_file, title: 'Importar CSV'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static Widget _info(String titulo, String valor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(
            child: Text(titulo, style: const TextStyle(color: Colors.grey)),
          ),
          Text(valor, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  static Widget _menuCard({required IconData icon, required String title}) {
    return Card(
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {},
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 36, color: AppColors.primary),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
