import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:econoway_app/controller/carrinho_controller.dart';
import 'package:econoway_app/main.dart';
import 'package:econoway_app/services/auth_service.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  Future<void> waitFor(WidgetTester tester, Finder finder) async {
    for (var i = 0; i < 80 && finder.evaluate().isEmpty; i++) {
      await tester.pump(const Duration(milliseconds: 250));
    }
    expect(finder, findsWidgets);
  }

  testWidgets('history flow persists snapshot', (tester) async {
    await AuthService.logout();
    CarrinhoController().limpar();
    await tester.pumpWidget(EconoWayApp());
    await waitFor(tester, find.text('Entrar no App'));
    await tester.tap(find.text('Entrar no App'));
    await tester.pumpAndSettle();
    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'usuario-demo@econoway.local');
    await tester.enterText(fields.at(1), 'troque-a-senha-demo-usuario');
    await tester.tap(find.text('Entrar'));
    await waitFor(tester, find.textContaining('Comparar preços'));
    await tester.tap(find.textContaining('Comparar preços'));
    await waitFor(tester, find.text('Produtos'));
    await tester.tap(find.byIcon(Icons.add).first);
    await tester.tap(find.text('Ver carrinho'));
    await waitFor(tester, find.text('Escolher mercados e comparar'));
    await tester.ensureVisible(find.text('Escolher mercados e comparar'));
    await tester.tap(find.text('Escolher mercados e comparar'));
    await waitFor(tester, find.text('Mercado Demo Centro'));
    await tester.tap(find.text('Mercado Demo Centro'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Mercado Demo Bairro'));
    await tester.pumpAndSettle();
    await waitFor(tester, find.text('Comparar 2 mercado(s)'));
    await tester.tap(find.text('Comparar 2 mercado(s)'));
    await waitFor(tester, find.textContaining('Salvar'));
    await tester.tap(find.textContaining('Salvar'));
    await tester.pumpAndSettle();
    for (var i = 0; i < 5; i++) {
      await tester.binding.handlePopRoute();
      await tester.pumpAndSettle();
    }
    await tester.pumpWidget(EconoWayApp());
    await waitFor(tester, find.textContaining('Comparar preços'));
    await tester.ensureVisible(find.text('Histórico'));
    await tester.tap(find.text('Histórico'));
    await waitFor(tester, find.text('Histórico'));
    expect(find.text('Mercado Demo Centro'), findsWidgets);
  });
}
