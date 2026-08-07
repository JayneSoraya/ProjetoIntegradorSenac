import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class CadastroScreen extends StatefulWidget {
  const CadastroScreen({super.key});

  @override
  State<CadastroScreen> createState() => _CadastroScreenState();
}

class _CadastroScreenState extends State<CadastroScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nomeController = TextEditingController();
  final _emailController = TextEditingController();
  final _senhaController = TextEditingController();
  final _confirmarSenhaController = TextEditingController();

  bool _carregando = false;

  @override
  void dispose() {
    _nomeController.dispose();
    _emailController.dispose();
    _senhaController.dispose();
    _confirmarSenhaController.dispose();
    super.dispose();
  }

  void _mostrarMensagem(String mensagem, {bool erro = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensagem),
        backgroundColor: erro ? Colors.red : Colors.green,
      ),
    );
  }

  Future<void> _cadastrar() async {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) return;
    if (_carregando) return;

    setState(() => _carregando = true);

    try {
      final resultado = await AuthService.cadastrar(
        _nomeController.text.trim(),
        _emailController.text.trim(),
        _senhaController.text,
      );

      if (!mounted) return;

      if (resultado['status'] == 'sucesso') {
        _mostrarMensagem('Conta criada com sucesso!');

        Navigator.pop(context); // volta para login
      } else {
        _mostrarMensagem(
          resultado['mensagem'] ?? 'Erro ao cadastrar',
          erro: true,
        );
      }
    } catch (e) {
      _mostrarMensagem('Erro inesperado. Tente novamente.', erro: true);
    } finally {
      if (mounted) {
        setState(() => _carregando = false);
      }
    }
  }

  // CAMPO PADRÃO
  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      filled: true,
      fillColor: Theme.of(context).colorScheme.surface,

      prefixIcon: Icon(icon),

      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),

      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade400),
      ),

      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cadastro')),

      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),

          child: Form(
            key: _formKey,

            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),

                const Text(
                  'Criar conta',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 30),

               
                TextFormField(
                  controller: _nomeController,
                  decoration: _inputDecoration(
                    'Nome completo',
                    Icons.person_outline,
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) {
                      return 'Informe seu nome';
                    }
                    if (v.length < 3) {
                      return 'Nome muito curto';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: _inputDecoration('E-mail', Icons.email_outlined),
                  validator: (v) {
                    if (v == null || v.isEmpty) {
                      return 'Informe seu e-mail';
                    }
                    if (!RegExp(r'\S+@\S+\.\S+').hasMatch(v)) {
                      return 'E-mail inválido';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                TextFormField(
                  controller: _senhaController,
                  obscureText: true,
                  decoration: _inputDecoration('Senha', Icons.lock_outline),
                  validator: (v) {
                    if (v == null || v.isEmpty) {
                      return 'Informe a senha';
                    }
                    if (v.length < 6) {
                      return 'Mínimo de 6 caracteres';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                
                TextFormField(
                  controller: _confirmarSenhaController,
                  obscureText: true,
                  decoration: _inputDecoration(
                    'Confirmar senha',
                    Icons.lock_outline,
                  ),
                  validator: (v) {
                    if (v != _senhaController.text) {
                      return 'As senhas não coincidem';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 24),

                // BOTÃO
                ElevatedButton(
                  onPressed: _carregando ? null : _cadastrar,

                  child: _carregando
                      ? const CircularProgressIndicator()
                      : const Text('Cadastrar'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
