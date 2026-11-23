import 'package:econoway_app/controller/carrinho_controller.dart';
import 'package:econoway_app/screens/carrinho_vazio_screen.dart';
import 'package:econoway_app/screens/home_screen.dart';
import 'package:econoway_app/theme/app_theme.dart';
import 'package:econoway_app/widgets/cart_scope.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void _telaPequena(WidgetTester tester) {
  tester.view.physicalSize = const Size(320, 568);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
}

void main() {
  testWidgets('Home não estoura a linha com nome de usuário longo em 320x568', (
    tester,
  ) async {
    _telaPequena(tester);

    await tester.pumpWidget(
      CartScope(
        controller: CarrinhoController(),
        child: MaterialApp(
          theme: AppTheme.light,
          home: const HomeScreen(
            nomeUsuario:
                'Maria Aparecida de Nazaré Albuquerque Montenegro Figueiredo',
          ),
        ),
      ),
    );
    await tester.pump();

    expect(find.textContaining('Olá, Maria'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Carrinho vazio mostra orientação e ação em 320x568', (
    tester,
  ) async {
    _telaPequena(tester);

    await tester.pumpWidget(
      MaterialApp(theme: AppTheme.light, home: const CarrinhoVazioScreen()),
    );

    expect(find.text('Seu carrinho está vazio'), findsOneWidget);
    expect(
      find.text('Adicione produtos para comparar preços entre supermercados.'),
      findsOneWidget,
    );
    expect(find.text('Buscar produtos'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
