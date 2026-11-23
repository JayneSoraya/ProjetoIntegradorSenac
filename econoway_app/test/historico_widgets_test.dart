import 'package:econoway_app/models/progresso_contribuicao.dart';
import 'package:econoway_app/screens/compartilhar_resultado_screen.dart';
import 'package:econoway_app/theme/app_theme.dart';
import 'package:econoway_app/widgets/progresso_mapa_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Widget _app(Widget child) => MaterialApp(
  theme: AppTheme.light,
  home: Scaffold(body: child),
);

void main() {
  testWidgets('ProgressoMapaWidget mostra metas e nível sem overflow', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      _app(
        SingleChildScrollView(
          child: ProgressoMapaWidget(
            onEscanear: () async {},
            carregador: () async => const ProgressoContribuicao(
              progresso: 0.4,
              notasImportadas: 3,
              metaNotas: 10,
              notasRestantes: 7,
              produtosComPreco: 12,
              metaProdutos: 50,
              totalMercados: 4,
              concluido: false,
              mensagem:
                  'Faltam 7 notas para completar sua meta de contribuição.',
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('40%'), findsOneWidget);
    expect(find.textContaining('Faltam 7 notas'), findsOneWidget);
    expect(find.text('3/10 notas'), findsOneWidget);
    expect(find.textContaining('EconoWayer Bronze'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('ProgressoMapaWidget oferece nova tentativa quando falha', (
    tester,
  ) async {
    var tentativas = 0;
    await tester.pumpWidget(
      _app(
        ProgressoMapaWidget(
          carregador: () async {
            tentativas++;
            throw Exception('falha');
          },
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Tentar'), findsOneWidget);
    await tester.tap(find.text('Tentar'));
    await tester.pumpAndSettle();
    expect(tentativas, 2);
  });

  testWidgets('CompartilharResultadoScreen cabe em tela pequena', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(320, 568);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: const CompartilharResultadoScreen(
          mercadoEscolhido: 'Supermercado com um nome bastante longo da região',
          valorEscolhido: 180.5,
          valorReferencia: 210,
          economia: 29.5,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('R\$ 29,50'), findsOneWidget);
    expect(find.textContaining('14,0% mais barato'), findsOneWidget);
    expect(find.text('Copiar texto'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
