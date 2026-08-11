import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/perfil_usuario.dart';
import '../services/auth_service.dart';
import '../services/perfil_service.dart';
import '../theme/app_theme.dart';
import 'welcome_screen.dart';

class PerfilScreen extends StatefulWidget {
  const PerfilScreen({super.key});

  @override
  State<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends State<PerfilScreen> {
  final _formKey = GlobalKey<FormState>();
  final _cep = TextEditingController();
  final _endereco = TextEditingController();
  final _tipoVeiculo = TextEditingController();

  PerfilUsuario? _perfil;
  bool _carregando = true;
  bool _salvando = false;
  String? _erro;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  @override
  void dispose() {
    _cep.dispose();
    _endereco.dispose();
    _tipoVeiculo.dispose();
    super.dispose();
  }

  Future<void> _carregar() async {
    try {
      final perfil = await PerfilService.buscar();
      if (!mounted) return;
      _cep.text = perfil.cep ?? '';
      _endereco.text = perfil.endereco ?? '';
      _tipoVeiculo.text = perfil.tipoVeiculo ?? '';
      setState(() {
        _perfil = perfil;
        _carregando = false;
        _erro = null;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _carregando = false;
        _erro = 'Não foi possível carregar o perfil.';
      });
    }
  }

  Future<void> _salvar() async {
    if (!_formKey.currentState!.validate() || _salvando) return;
    setState(() => _salvando = true);
    try {
      final perfil = await PerfilService.atualizar(
        cep: _cep.text,
        endereco: _endereco.text,
        tipoVeiculo: _tipoVeiculo.text,
      );
      if (!mounted) return;
      setState(() => _perfil = perfil);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Perfil atualizado.')));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Não foi possível atualizar o perfil.')),
      );
    } finally {
      if (mounted) setState(() => _salvando = false);
    }
  }

  Future<void> _copiarExportacao() async {
    try {
      final dados = await PerfilService.exportar();
      await Clipboard.setData(
        ClipboardData(text: const JsonEncoder.withIndent('  ').convert(dados)),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Seus dados foram copiados em JSON.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Não foi possível exportar os dados.')),
      );
    }
  }

  Future<void> _sair() async {
    await AuthService.logout();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const WelcomeScreen()),
      (_) => false,
    );
  }

  Future<void> _confirmarExclusao() async {
    final senha = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Excluir minha conta?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Esta ação remove a conta e os dados vinculados pelas regras de cascata do banco. Confirme sua senha para continuar.',
            ),
            const SizedBox(height: 16),
            TextField(
              controller: senha,
              obscureText: true,
              autofocus: true,
              decoration: const InputDecoration(labelText: 'Senha atual'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Excluir definitivamente'),
          ),
        ],
      ),
    );

    final password = senha.text;
    senha.dispose();
    if (confirmed != true || password.isEmpty || !mounted) return;

    try {
      await PerfilService.excluir(password);
      await AuthService.logout();
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const WelcomeScreen()),
        (_) => false,
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: _carregando
          ? const Center(child: CircularProgressIndicator())
          : _erro != null
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(_erro!, textAlign: TextAlign.center),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: _carregar,
                      child: const Text('Tentar novamente'),
                    ),
                  ],
                ),
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(24),
              children: [
                Text(
                  _perfil!.nome,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _perfil!.email,
                  style: const TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 28),
                Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      TextFormField(
                        controller: _cep,
                        keyboardType: TextInputType.number,
                        maxLength: 8,
                        decoration: const InputDecoration(
                          labelText: 'CEP',
                          counterText: '',
                        ),
                        validator: (value) {
                          final digits = (value ?? '').replaceAll(
                            RegExp(r'\D'),
                            '',
                          );
                          if (digits.isNotEmpty && digits.length != 8) {
                            return 'Informe 8 dígitos ou deixe vazio.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _endereco,
                        maxLength: 255,
                        decoration: const InputDecoration(
                          labelText: 'Endereço de referência',
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _tipoVeiculo,
                        maxLength: 50,
                        decoration: const InputDecoration(
                          labelText: 'Tipo de veículo (opcional)',
                        ),
                      ),
                      const SizedBox(height: 8),
                      FilledButton.icon(
                        onPressed: _salvando ? null : _salvar,
                        icon: const Icon(Icons.save_outlined),
                        label: Text(
                          _salvando ? 'Salvando...' : 'Salvar perfil',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                Text(
                  'Privacidade e conta',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(
                    Icons.download_outlined,
                    color: AppColors.primary,
                  ),
                  title: const Text('Exportar meus dados'),
                  subtitle: const Text(
                    'Copia um snapshot JSON para a área de transferência.',
                  ),
                  onTap: _copiarExportacao,
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.logout, color: AppColors.primary),
                  title: const Text('Sair'),
                  onTap: _sair,
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(
                    Icons.delete_forever_outlined,
                    color: Colors.redAccent,
                  ),
                  title: const Text(
                    'Excluir minha conta',
                    style: TextStyle(color: Colors.redAccent),
                  ),
                  subtitle: const Text('Exige confirmação da senha atual.'),
                  onTap: _confirmarExclusao,
                ),
              ],
            ),
    );
  }
}
