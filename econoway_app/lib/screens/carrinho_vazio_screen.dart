import 'package:flutter/material.dart';

import '../widgets/estado_tela.dart';
import 'produtos_screen.dart';

class CarrinhoVazioScreen extends StatelessWidget {
  const CarrinhoVazioScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Carrinho')),
      body: SafeArea(
        child: EstadoVazio(
          icone: Icons.shopping_cart_outlined,
          titulo: 'Seu carrinho está vazio',
          mensagem:
              'Adicione produtos para comparar preços entre supermercados.',
          rotuloAcao: 'Buscar produtos',
          onAcao: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const ProdutosScreen()),
          ),
        ),
      ),
    );
  }
}
