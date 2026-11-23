import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'screens/home_screen.dart';
import 'screens/welcome_screen.dart';
import 'services/auth_service.dart';
import 'controller/carrinho_controller.dart';
import 'widgets/cart_scope.dart';

void main() {
  runApp(EconoWayApp());
}

class EconoWayApp extends StatelessWidget {
  final CarrinhoController cart;

  EconoWayApp({super.key, CarrinhoController? cart})
    : cart = cart ?? CarrinhoController();

  @override
  Widget build(BuildContext context) {
    return CartScope(
      controller: cart,
      child: MaterialApp(
        title: 'EconoWay',
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        themeMode: ThemeMode.light,
        home: const SplashAuth(),
      ),
    );
  }
}

class SplashAuth extends StatefulWidget {
  const SplashAuth({super.key});

  @override
  State<SplashAuth> createState() => _SplashAuthState();
}

class _SplashAuthState extends State<SplashAuth> {
  @override
  void initState() {
    super.initState();
    _verificarSessao();
  }

  Future<void> _verificarSessao() async {
    await Future.delayed(const Duration(milliseconds: 500));

    final loggedIn = await AuthService.isUserLoggedIn();
    if (!mounted) return;

    if (loggedIn) {
      final nome = await AuthService.getNome();
      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => HomeScreen(nomeUsuario: nome)),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WelcomeScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
    );
  }
}
