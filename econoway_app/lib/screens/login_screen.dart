import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';
import 'cadastro_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _senhaController = TextEditingController();

  bool _carregando = false;
  bool _senhaVisivel = false;

  @override
  void dispose() {
    _emailController.dispose();
    _senhaController.dispose();
    super.dispose();
  }

  void _mostrarErro(String? mensagem) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensagem ?? 'Erro ao fazer login.'),
        backgroundColor: Colors.redAccent,
      ),
    );
  }

  Future<void> _fazerLogin() async {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) return;
    if (_carregando) return;

    setState(() => _carregando = true);

    try {
      final resultado = await AuthService.login(
        _emailController.text.trim(),
        _senhaController.text,
      );

      if (!mounted) return;

      if (resultado['status'] == 'sucesso') {
        final nomeUsuario = resultado['usuario']['nome'] as String;

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (_) => HomeScreen(nomeUsuario: nomeUsuario),
          ),
          (route) => false,
        );
      } else {
        _mostrarErro(resultado['mensagem']);
      }
    } catch (e) {
      _mostrarErro('Erro inesperado. Tente novamente.');
    } finally {
      if (mounted) {
        setState(() => _carregando = false);
      }
    }
  }

  // CAMPO EMAIL
  Widget _buildEmailField() {
    return TextFormField(
      controller: _emailController,
      keyboardType: TextInputType.emailAddress,
      decoration: InputDecoration(
        labelText: 'E-mail',
        filled: true,

        fillColor: Theme.of(context).colorScheme.surface,

        prefixIcon: const Icon(Icons.email_outlined),

        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),

        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade400),
        ),

        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
      ),
      validator: (v) {
        if (v == null || v.isEmpty) return 'Informe seu e-mail';
        if (!RegExp(r'\S+@\S+\.\S+').hasMatch(v)) {
          return 'E-mail inválido';
        }
        return null;
      },
    );
  }

  // CAMPO SENHA
  Widget _buildSenhaField() {
    return TextFormField(
      controller: _senhaController,
      obscureText: !_senhaVisivel,
      decoration: InputDecoration(
        labelText: 'Senha',
        filled: true,

        fillColor: Theme.of(context).colorScheme.surface,

        prefixIcon: const Icon(Icons.lock_outline),
        suffixIcon: IconButton(
          icon: Icon(_senhaVisivel ? Icons.visibility_off : Icons.visibility),
          onPressed: () {
            setState(() => _senhaVisivel = !_senhaVisivel);
          },
        ),

        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),

        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade400),
        ),

        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
      ),
      validator: (v) {
        if (v == null || v.isEmpty) return 'Informe sua senha';
        return null;
      },
    );
  }

  Widget _buildBotaoLogin() {
    return ElevatedButton(
      onPressed: _carregando ? null : _fazerLogin,
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child: _carregando
          ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator.adaptive(strokeWidth: 2),
            )
          : const Text(
              'Entrar',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,

      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),

            child: Form(
              key: _formKey,

              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(
                    Icons.savings_outlined,
                    size: 72,
                    color: AppColors.primary,
                  ),

                  const SizedBox(height: 16),

                  const Text(
                    'EconoWay',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),

                  const SizedBox(height: 8),

                  const Text(
                    'Economize na sua compra de mercado',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),

                  const SizedBox(height: 40),

                  _buildEmailField(),
                  const SizedBox(height: 16),

                  _buildSenhaField(),
                  const SizedBox(height: 8),

                  const SizedBox(height: 16),
                  _buildBotaoLogin(),

                  const SizedBox(height: 24),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Não tem conta? '),
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const CadastroScreen(),
                            ),
                          );
                        },
                        child: const Text(
                          'Cadastre-se',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
