import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:econoway_app/controller/carrinho_controller.dart';
import 'package:econoway_app/main.dart';
import 'package:econoway_app/services/auth_service.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('auth flow abre Home', (tester) async {
    await AuthService.logout();
    CarrinhoController().limpar();
    await tester.pumpWidget(EconoWayApp());
    for (
      var i = 0;
      i < 80 && find.text('Entrar no App').evaluate().isEmpty;
      i++
    ) {
      await tester.pump(const Duration(milliseconds: 250));
    }
    expect(find.text('Entrar no App'), findsOneWidget);
  });
}
