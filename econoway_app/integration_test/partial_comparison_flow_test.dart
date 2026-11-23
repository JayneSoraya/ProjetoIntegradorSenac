import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:econoway_app/models/mercado_comparacao_dto.dart';
import 'package:econoway_app/screens/comparacao_screen.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('partial comparison is explicit', (tester) async {
    const partial = ComparacaoResultadoDTO(
      mercados: [
        MercadoComparacaoDTO(
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
      resumo: ComparacaoResumoDTO(
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
    await tester.pumpAndSettle();
    expect(find.textContaining('parcial'), findsWidgets);
    expect(find.textContaining('Itens faltantes'), findsOneWidget);
  });
}
