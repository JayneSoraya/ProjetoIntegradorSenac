import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:econoway_app/controller/carrinho_controller.dart';
import 'package:econoway_app/main.dart';
import 'package:econoway_app/models/mercado_comparacao_dto.dart';
import 'package:econoway_app/screens/comparacao_screen.dart';
import 'package:econoway_app/services/auth_service.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  Future<void> waitFor(WidgetTester tester, Finder finder) async {
    for (var i = 0; i < 80 && finder.evaluate().isEmpty; i++) {
      await tester.pump(const Duration(milliseconds: 250));
    }
    expect(finder, findsWidgets);
  }

  Future<void> login(WidgetTester tester) async {
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
  }

  Future<void> addProductAndOpenCart(WidgetTester tester) async {
    await tester.tap(find.textContaining('Comparar preços'));
    await waitFor(tester, find.text('Produtos'));
    await waitFor(tester, find.byIcon(Icons.add));
    await tester.tap(find.byIcon(Icons.add).first);
    await tester.tap(find.text('Ver carrinho'));
    await waitFor(tester, find.text('Escolher mercados e comparar'));
  }

  Future<void> saveComparison(WidgetTester tester) async {
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
  }

  testWidgets('auth abre Home', (tester) async {
    await login(tester);
    expect(find.textContaining('Comparar preços'), findsOneWidget);
  });

  testWidgets('produto entra no carrinho', (tester) async {
    await login(tester);
    await addProductAndOpenCart(tester);
    expect(find.text('Escolher mercados e comparar'), findsOneWidget);
  });

  testWidgets('comparaÃ§Ã£o salva', (tester) async {
    await login(tester);
    await addProductAndOpenCart(tester);
    await saveComparison(tester);
    await waitFor(tester, find.textContaining('salva'));
  });

  testWidgets('histÃ³rico reabre snapshot', (tester) async {
    await login(tester);
    await addProductAndOpenCart(tester);
    await saveComparison(tester);
    for (
      var i = 0;
      i < 5 && find.text('Comparar preÃ§os').evaluate().isEmpty;
      i++
    ) {
      await tester.binding.handlePopRoute();
      await tester.pumpAndSettle();
    }
    await tester.ensureVisible(find.text('Histórico'));
    await tester.tap(find.text('Histórico'));
    await waitFor(tester, find.text('Histórico'));
    expect(find.text('Mercado Demo Centro'), findsWidgets);
  });

  testWidgets('comparaÃ§Ã£o parcial Ã© identificada', (tester) async {
    final partial = ComparacaoResultadoDTO(
      mercados: [
        const MercadoComparacaoDTO(
          idSupermercado: 7,
          nome: 'Mercado Parcial',
          total: 9.90,
          totalFidelidade: 9.90,
          totalItens: 2,
          itensEncontrados: 1,
          itensFaltando: 1,
          itensDesatualizados: 0,
          carrinhoCompleto: false,
          encontrados: [],
          faltando: [
            {'nomeProduto': 'Produto ausente'},
          ],
        ),
      ],
      resumo: const ComparacaoResumoDTO(
        melhorMercadoId: null,
        melhorMercado: null,
        melhorTotal: 0,
        mediaTresMaisCaros: 0,
        economiaPotencial: 0,
        mercadosAvaliados: 1,
        mercadosCompletos: 0,
        salvo: false,
        idComparacao: null,
        itensDesatualizadosTotal: 0,
      ),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: ComparacaoScreen(
          loader: ({supermercados, salvar = false}) async => partial,
        ),
      ),
    );
    await waitFor(tester, find.textContaining('parcial'));
    expect(find.textContaining('parciais'), findsOneWidget);
    expect(find.textContaining('Itens faltantes'), findsOneWidget);
  });
}
