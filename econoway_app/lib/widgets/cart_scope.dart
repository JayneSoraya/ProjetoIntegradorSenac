import 'package:flutter/widgets.dart';
import '../controller/carrinho_controller.dart';

class CartScope extends InheritedNotifier<CarrinhoController> {
  final CarrinhoController controller;

  const CartScope({super.key, required this.controller, required super.child})
    : super(notifier: controller);

  static CarrinhoController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<CartScope>();
    assert(scope != null, 'CartScope ausente na árvore de widgets.');
    return scope!.controller;
  }
}
