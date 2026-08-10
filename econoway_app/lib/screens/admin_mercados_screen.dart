import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:file_picker/file_picker.dart' as fp;
import '../services/auth_service.dart';
import '../theme/app_theme.dart';



class AdminMercadosScreen extends StatefulWidget {
  const AdminMercadosScreen({super.key});

  @override
  State<AdminMercadosScreen> createState() => _AdminMercadosScreenState();
}

class _AdminMercadosScreenState extends State<AdminMercadosScreen> {
  static const String _baseUrl = 'http://192.168.1.11:3333/api/admin';

  List<Map<String, dynamic>> _mercados = [];
  bool _carregando = true;
  String _erro = ''; // fix: guarda mensagem de erro para mostrar na tela

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<Map<String, String>> get _headers async {
    final token = await AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // fix: trata 403 e timeout em vez de ficar carregando infinitamente
  Future<void> _carregar() async {
    setState(() {
      _carregando = true;
      _erro = '';
    });
    try {
      final response = await http
          .get(Uri.parse('$_baseUrl/mercados'), headers: await _headers)
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        setState(() {
          _mercados = data.cast<Map<String, dynamic>>();
          _carregando = false;
        });
      } else if (response.statusCode == 403) {
        setState(() {
          _carregando = false;
          _erro =
              'Acesso negado.\nFaça logout e entre com a conta admin.\n(O token precisa conter tipo_conta)';
        });
      } else {
        setState(() {
          _carregando = false;
          _erro = 'Erro ${response.statusCode}: ${response.body}';
        });
      }
    } catch (e) {
      setState(() {
        _carregando = false;
        _erro = 'Falha na conexão: $e';
      });
    }
  }

  Future<void> _cadastrarMercado() async {
    final cnpjCtrl = TextEditingController();
    final nomeCtrl = TextEditingController();
    final endCtrl = TextEditingController();

    await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Novo Supermercado'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: cnpjCtrl,
              decoration: const InputDecoration(labelText: 'CNPJ'),
            ),
            TextField(
              controller: nomeCtrl,
              decoration: const InputDecoration(labelText: 'Nome'),
            ),
            TextField(
              controller: endCtrl,
              decoration: const InputDecoration(labelText: 'Endereço'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              final response = await http.post(
                Uri.parse('$_baseUrl/mercados'),
                headers: await _headers,
                body: jsonEncode({
                  'cnpj': cnpjCtrl.text,
                  'nome_fantasia': nomeCtrl.text,
                  'endereco_completo': endCtrl.text,
                }),
              );
              if (!mounted) return;
              Navigator.pop(context);
              if (response.statusCode == 201) {
                _carregar();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Mercado cadastrado!')),
                );
              }
            },
            child: const Text('Salvar'),
          ),
        ],
      ),
    );
  }

  // ── Importação em massa via CSV ────────────────────────────
  Future<void> _importarCSV() async {
    // Mostra formato esperado
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Importar CSV em massa'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Formato do arquivo:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'cnpj,nome_fantasia,endereco_completo\n'
                '11.111.111/0001-11,Savegnago,Rua X 100 Araraquara SP\n'
                '22.222.222/0001-22,Tonin,Av. Y 200 Araraquara SP',
                style: TextStyle(fontFamily: 'monospace', fontSize: 11),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'A primeira linha (cabeçalho) é ignorada automaticamente.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Selecionar arquivo'),
          ),
        ],
      ),
    );

    if (confirmar != true) return;

    // Abre seletor de arquivo
    
    final resultado = await fp.FilePicker.pickFiles(
      type: fp.FileType.custom,
      allowedExtensions: ['csv', 'txt'],
    );

    if (resultado == null || resultado.files.isEmpty) return;

    final arquivo = File(resultado.files.single.path!);
    final linhas = await arquivo.readAsLines();

    if (linhas.length <= 1) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Arquivo vazio ou sem dados.')),
      );
      return;
    }

    // Processa CSV — pula cabeçalho
    final mercados = <Map<String, String>>[];
    for (int i = 1; i < linhas.length; i++) {
      final linha = linhas[i].trim();
      if (linha.isEmpty) continue;
      final colunas = linha.split(',');
      if (colunas.length < 3) continue;
      mercados.add({
        'cnpj': colunas[0].trim(),
        'nome_fantasia': colunas[1].trim(),
        'endereco_completo': colunas.sublist(2).join(',').trim(),
      });
    }

    if (mercados.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nenhum mercado válido encontrado.')),
      );
      return;
    }

    // Preview antes de enviar
    if (!mounted) return;
    final enviar = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('${mercados.length} mercados encontrados'),
        content: SizedBox(
          height: 200,
          child: ListView.builder(
            itemCount: mercados.length,
            itemBuilder: (_, i) => ListTile(
              dense: true,
              leading: const Icon(
                Icons.store,
                color: AppColors.primary,
                size: 18,
              ),
              title: Text(
                mercados[i]['nome_fantasia']!,
                style: const TextStyle(fontSize: 13),
              ),
              subtitle: Text(
                mercados[i]['cnpj']!,
                style: const TextStyle(fontSize: 11),
              ),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Importar todos'),
          ),
        ],
      ),
    );

    if (enviar != true) return;

    // Envia ao backend
    int salvos = 0;
    int erros = 0;
    final headers = await _headers;

    for (final m in mercados) {
      try {
        final response = await http.post(
          Uri.parse('$_baseUrl/mercados'),
          headers: headers,
          body: jsonEncode(m),
        );
        response.statusCode == 201 ? salvos++ : erros++;
      } catch (_) {
        erros++;
      }
    }

    if (!mounted) return;
    _carregar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '$salvos mercados importados'
          '${erros > 0 ? " · $erros com erro" : "."}',
        ),
      ),
    );
  }

  Future<void> _removerMercado(int id, String nome) async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Remover mercado'),
        content: Text('Remover $nome?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Remover', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmar == true) {
      await http.delete(
        Uri.parse('$_baseUrl/mercados/$id'),
        headers: await _headers,
      );
      _carregar();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Supermercados'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _carregar),
        ],
      ),

      // Dois botões: importar CSV (mini) + novo individual
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton(
            heroTag: 'csv',
            mini: true,
            backgroundColor: AppColors.secondary,
            foregroundColor: Colors.white,
            tooltip: 'Importar CSV',
            onPressed: _importarCSV,
            child: const Icon(Icons.upload_file),
          ),
          const SizedBox(height: 8),
          FloatingActionButton.extended(
            heroTag: 'novo',
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            onPressed: _cadastrarMercado,
            icon: const Icon(Icons.add),
            label: const Text('Novo mercado'),
          ),
        ],
      ),

      body: _carregando
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          // fix: mostra erro com botão de retry em vez de carregamento infinito
          : _erro.isNotEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: Colors.red,
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _erro,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.red),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _carregar,
                      child: const Text('Tentar novamente'),
                    ),
                  ],
                ),
              ),
            )
          : _mercados.isEmpty
          ? const Center(child: Text('Nenhum supermercado cadastrado.'))
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              itemCount: _mercados.length,
              itemBuilder: (_, i) {
                final m = _mercados[i];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.store, color: AppColors.primary),
                    ),
                    title: Text(
                      m['nome_fantasia'] ?? '',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(
                          'CNPJ: ${m['cnpj'] ?? ''}',
                          style: const TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        Text(
                          '${m['total_produtos'] ?? 0} produtos cadastrados',
                          style: TextStyle(
                            color: AppColors.secondary,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                        if (m['ultima_atualizacao'] != null)
                          Text(
                            'Atualizado: ${m['ultima_atualizacao'].toString().substring(0, 10)}',
                            style: const TextStyle(
                              color: Colors.grey,
                              fontSize: 11,
                            ),
                          ),
                      ],
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      onPressed: () => _removerMercado(
                        m['id_supermercado'],
                        m['nome_fantasia'],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
