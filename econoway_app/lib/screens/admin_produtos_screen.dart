import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class AdminProdutosScreen extends StatefulWidget {
  const AdminProdutosScreen({super.key});

  @override
  State<AdminProdutosScreen> createState() => _AdminProdutosScreenState();
}

class _AdminProdutosScreenState extends State<AdminProdutosScreen> {
  static const String _baseUrl = 'http://192.168.1.11:3333/api/admin';

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
      final uri = Uri.parse(
        '$_baseUrl/produtos',
      ).replace(queryParameters: busca.isNotEmpty ? {'busca': busca} : null);
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

  Future<void> _corrigirCategoria(int idProduto, String categoriaAtual) async {
    String selecionada = categoriaAtual;

    await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Corrigir categoria'),
        content: StatefulBuilder(
          builder: (_, setS) => DropdownButton<String>(
            value: _categorias.contains(selecionada)
                ? selecionada
                : _categorias.last,
            isExpanded: true,
            items: _categorias
                .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                .toList(),
            onChanged: (v) => setS(() => selecionada = v!),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              await http.patch(
                Uri.parse('$_baseUrl/produtos/$idProduto/categoria'),
                headers: await _headers,
                body: jsonEncode({'categoria': selecionada}),
              );
              if (!mounted) return;
              Navigator.pop(context);
              _carregar(busca: _buscaCtrl.text);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Categoria atualizada!')),
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
                                  color: cor.withOpacity(0.1),
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
                                '${p['total_mercados'] ?? 0} mercados · R\$ ${(p['menor_preco'] ?? 0).toStringAsFixed(2)}',
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
                            onPressed: () =>
                                _corrigirCategoria(p['id_produto'], categoria),
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
