import 'package:flutter/material.dart';

class CarrinhoVazioScreen extends StatelessWidget {
  const CarrinhoVazioScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Carrinho vazio'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [

            const SizedBox(height: 40),

            Container(
              height: 250,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(30),
              ),
              child: const Center(
                child: Text(
                  'Nenhum produto\nadicionado',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 30),

            const Text(
              'Para comparar preços, adicione pelo menos um produto ao carrinho.',
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 40),

            Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [

                    Row(
                      mainAxisAlignment:
                          MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('Itens'),
                        Text('0'),
                      ],
                    ),

                    SizedBox(height: 10),

                    Row(
                      mainAxisAlignment:
                          MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('Subtotal'),
                        Text('R\$ 0,00'),
                      ],
                    ),

                    SizedBox(height: 10),

                    Row(
                      mainAxisAlignment:
                          MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('Mercados disponíveis'),
                        Text('0'),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const Spacer(),

            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: null,
                child: const Text(
                  'Comparar preços',
                ),
              ),
            ),

          ],
        ),
      ),
    );
  }
}