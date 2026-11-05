import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../core/config/app_config.dart';

class AdminProdutosScreen extends StatefulWidget {
  const AdminProdutosScreen({super.key});

  @override
  State<AdminProdutosScreen> createState() => _AdminProdutosScreenState();
}

class _AdminProdutosScreenState extends State<AdminProdutosScreen> {
  List<Map<String, dynamic>> _produtos = [];
  bool _carregando = true;
  final _buscaCtrl = TextEditingController();

  final List<String> _categorias = [
    'Alimentos',
    'Bebidas',
    'Higiene e Limpeza',
    'Carnes e Peixes',
    'Laticínios',
    'Snacks',
    'Hortifruti',
    'Padaria',
    'Outros',
  ];

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
      final url = AppConfig.endpoint('/admin/produtos');
      final uri = url.replace(
        queryParameters: busca.isNotEmpty ? {'busca': busca} : null,
      );

      final response = await http.get(uri, headers: await _headers);
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        setState(() {
          _produtos = data.cast<Map<String, dynamic>>();
          _carregando = false;
        });
      }
    } catch (_) {
      setState(() => _carregando = false);
    }
  }

  Future<void> _editarProduto(Map<String, dynamic> produto) async {
    final idProduto = produto['id_produto'];

    final nomeCtrl = TextEditingController(text: produto['nome_produto'] ?? '');
    final marcaCtrl = TextEditingController(text: produto['marca'] ?? '');
    final pesoCtrl = TextEditingController(
      text: produto['peso']?.toString() ?? '',
    );
    final unidadeCtrl = TextEditingController(
      text: produto['unidade_medida'] ?? '',
    );

    String categoriaSelecionada = produto['categoria'] ?? 'Outros';
    if (!_categorias.contains(categoriaSelecionada)) {
      categoriaSelecionada = 'Outros';
    }

    await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Editar Produto'),
        content: SingleChildScrollView(
          child: StatefulBuilder(
            builder: (_, setS) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nomeCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Nome do Produto',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: marcaCtrl,
                  decoration: const InputDecoration(labelText: 'Marca'),
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: categoriaSelecionada,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Categoria'),
                  items: _categorias
                      .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                      .toList(),
                  onChanged: (v) => setS(() => categoriaSelecionada = v!),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: pesoCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        decoration: const InputDecoration(
                          labelText: 'Peso / Qtd',
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      flex: 1,
                      child: TextField(
                        controller: unidadeCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Unidade (KG, L, etc)',
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              final url = AppConfig.endpoint('/admin/produtos/$idProduto');
              await http.patch(
                url,
                headers: await _headers,
                body: jsonEncode({
                  'nome_produto': nomeCtrl.text,
                  'marca': marcaCtrl.text.isEmpty ? null : marcaCtrl.text,
                  'categoria': categoriaSelecionada,
                  'peso': pesoCtrl.text.isEmpty
                      ? null
                      : double.tryParse(pesoCtrl.text.replaceAll(',', '.')),
                  'unidade_medida': unidadeCtrl.text.isEmpty
                      ? null
                      : unidadeCtrl.text.toUpperCase(),
                }),
              );
              if (!mounted) return;
              Navigator.pop(context);
              _carregar(busca: _buscaCtrl.text);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Produto atualizado com sucesso!'),
                ),
              );
            },
            child: const Text('Salvar'),
          ),
        ],
      ),
    );
  }

  Color _corCategoria(String? cat) {
    switch (cat) {
      case 'Alimentos':
        return Colors.orange;
      case 'Bebidas':
        return Colors.blue;
      case 'Higiene e Limpeza':
        return Colors.teal;
      case 'Carnes e Peixes':
        return Colors.red;
      case 'Laticínios':
        return Colors.yellow.shade800;
      case 'Snacks':
        return Colors.purple;
      case 'Hortifruti':
        return Colors.green;
      case 'Padaria':
        return Colors.brown;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Produtos'),
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
                hintText: 'Buscar produto ou marca',
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

          // ── Contador ───────────────────────────────────────
          if (!_carregando)
            Padding(
              padding: const EdgeInsets.only(left: 16, bottom: 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  '${_produtos.length} produtos',
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ),
            ),

          // ── Lista ──────────────────────────────────────────
          Expanded(
            child: _carregando
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  )
                : _produtos.isEmpty
                ? const Center(child: Text('Nenhum produto encontrado.'))
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _produtos.length,
                    itemBuilder: (_, i) {
                      final p = _produtos[i];
                      final categoria = p['categoria'] as String? ?? 'Outros';
                      final cor = _corCategoria(categoria);

                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: ListTile(
                          leading: Container(
                            width: 8,
                            height: 50,
                            decoration: BoxDecoration(
                              color: cor,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                          title: Text(
                            p['nome_produto'] ?? '',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 2),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: cor.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  categoria,
                                  style: TextStyle(
                                    color: cor,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${p['total_mercados'] ?? 0} mercados · R\$ ${(double.tryParse(p['menor_preco']?.toString() ?? '0') ?? 0.0).toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),
                          trailing: IconButton(
                            icon: const Icon(
                              Icons.edit_outlined,
                              color: AppColors.primary,
                              size: 20,
                            ),
                            onPressed: () => _editarProduto(p),
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
