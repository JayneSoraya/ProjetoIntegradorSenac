import 'package:flutter/material.dart';
import '../controller/carrinho_controller.dart';
import 'carrinho_vazio_screen.dart';

class CarrinhoScreen extends StatefulWidget {
  const CarrinhoScreen({super.key});

  @override
  State<CarrinhoScreen> createState() => _CarrinhoScreenState();
}

class _CarrinhoScreenState extends State<CarrinhoScreen> {
  final carrinho = CarrinhoController();

  @override
  Widget build(BuildContext context) {
    final itens = carrinho.itens;

    return Scaffold(
      appBar: AppBar(title: const Text("Carrinho")),

      body: itens.isEmpty
          ? const Center(child: Text("Seu carrinho está vazio"))
          : Column(
              children: [
                //  LISTA DE ITENS
                Expanded(
                  child: ListView.builder(
                    itemCount: itens.length,
                    itemBuilder: (context, index) {
                      final item = itens[index];

                      return ListTile(
                        title: Text(item.nomeProduto),
                        subtitle: Text("R\$ ${item.preco} x${item.quantidade}"),

                        //  BOTÃO REMOVER RF09
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () {
                            setState(() {
                              carrinho.remover(item.idProduto);
                            });

                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text("Produto removido")),
                            );
                          },
                        ),
                      );
                    },
                  ),
                ),

                //  TOTAL  RF10
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    "Total: R\$ ${carrinho.total.toStringAsFixed(2)}",
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
