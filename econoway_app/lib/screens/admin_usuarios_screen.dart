import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class AdminUsuariosScreen extends StatefulWidget {
  const AdminUsuariosScreen({super.key});

  @override
  State<AdminUsuariosScreen> createState() => _AdminUsuariosScreenState();
}

class _AdminUsuariosScreenState extends State<AdminUsuariosScreen> {
  static const String _baseUrl = 'http://192.168.1.11:3333/api/admin';

  List<Map<String, dynamic>> _usuarios = [];
  bool _carregando = true;
  final _buscaCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  @override
  void dispose() {
    _buscaCtrl.dispose();
    super.dispose();
  }

  Future<Map<String, String>> get _headers async {
    final token = await AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<void> _carregar({String busca = ''}) async {
    setState(() => _carregando = true);
    try {
      final uri = Uri.parse(
        '$_baseUrl/usuarios',
      ).replace(queryParameters: busca.isNotEmpty ? {'busca': busca} : null);
      final response = await http.get(uri, headers: await _headers);
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        setState(() {
          _usuarios = data.cast<Map<String, dynamic>>();
          _carregando = false;
        });
      }
    } catch (_) {
      setState(() => _carregando = false);
    }
  }

  Future<void> _bloquear(int idConta, String nome, bool bloqueado) async {
    final acao = bloqueado ? 'Desbloquear' : 'Bloquear';
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('$acao usuário'),
        content: Text('$acao $nome?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              acao,
              style: TextStyle(color: bloqueado ? Colors.green : Colors.red),
            ),
          ),
        ],
      ),
    );

    if (confirmar == true) {
      await http.patch(
        Uri.parse('$_baseUrl/usuarios/$idConta/bloquear'),
        headers: await _headers,
        body: jsonEncode({'bloquear': !bloqueado}),
      );
      _carregar(busca: _buscaCtrl.text);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Usuários'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _carregar(busca: _buscaCtrl.text),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Busca ──────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _buscaCtrl,
              onChanged: (v) => _carregar(busca: v),
              decoration: InputDecoration(
                hintText: 'Buscar por nome ou e-mail',
                prefixIcon: const Icon(Icons.search, color: AppColors.primary),
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // ── Lista ──────────────────────────────────────────
          Expanded(
            child: _carregando
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  )
                : _usuarios.isEmpty
                ? const Center(child: Text('Nenhum usuário encontrado.'))
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _usuarios.length,
                    itemBuilder: (_, i) {
                      final u = _usuarios[i];
                      final bloqueado = !(u['status_conta'] as bool? ?? true);
                      final coins = u['econo_coins'] ?? 50;
                      final comparacoes = u['total_comparacoes'] ?? 0;

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              // Avatar
                              CircleAvatar(
                                backgroundColor: bloqueado
                                    ? Colors.red.shade100
                                    : AppColors.primary.withOpacity(0.1),
                                child: Text(
                                  (u['nome'] as String? ?? 'U')
                                      .substring(0, 1)
                                      .toUpperCase(),
                                  style: TextStyle(
                                    color: bloqueado
                                        ? Colors.red
                                        : AppColors.primary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),

                              // Dados
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          u['nome'] ?? '',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 15,
                                          ),
                                        ),
                                        if (bloqueado) ...[
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 6,
                                              vertical: 2,
                                            ),
                                            decoration: BoxDecoration(
                                              color: Colors.red.shade50,
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: const Text(
                                              'Bloqueado',
                                              style: TextStyle(
                                                color: Colors.red,
                                                fontSize: 10,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      u['email'] ?? '',
                                      style: const TextStyle(
                                        color: Colors.grey,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.bolt,
                                          color: AppColors.secondary,
                                          size: 14,
                                        ),
                                        Text(
                                          ' $coins coins',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        const Icon(
                                          Icons.bar_chart_rounded,
                                          color: Colors.grey,
                                          size: 14,
                                        ),
                                        Text(
                                          ' $comparacoes comparações',
                                          style: const TextStyle(
                                            color: Colors.grey,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),

                              // Botão bloquear (futuro)
                              IconButton(
                                icon: Icon(
                                  bloqueado
                                      ? Icons.lock_open_rounded
                                      : Icons.lock_outline,
                                  color: bloqueado
                                      ? Colors.green
                                      : Colors.red.shade300,
                                  size: 20,
                                ),
                                onPressed: () => _bloquear(
                                  u['id_conta'],
                                  u['nome'],
                                  bloqueado,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
