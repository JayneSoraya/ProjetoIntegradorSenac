import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../core/config/app_config.dart';
import 'admin_editar_produtos_screen.dart';

class AdminProdutosScreen extends StatefulWidget {
  const AdminProdutosScreen({super.key});

  @override
  State<AdminProdutosScreen> createState() => _AdminProdutosScreenState();
}

class _AdminProdutosScreenState extends State<AdminProdutosScreen> {
  List<Map<String, dynamic>> _produtos = [];
  bool _carregando = true;
  final _buscaCtrl = TextEditingController();
  Timer? _debounce;

  String _filtroStatus = 'TODOS';
  String _filtroImagem = 'TODAS';

  // ── Helpers ────────────────────────────────────────────────
  String _statusDe(Map<String, dynamic> p) =>
      (p['status_enriquecimento'] ?? 'PENDENTE').toString();

  bool _temImagem(Map<String, dynamic> p) =>
      p['imagem_url'] != null && p['imagem_url'].toString().isNotEmpty;

  // ── Contadores ─────────────────────────────────────────────
  int get _totalPendentes =>
      _produtos.where((p) => _statusDe(p) == 'PENDENTE').length;

  int get _totalEnriquecidos =>
      _produtos.where((p) => _statusDe(p) == 'ENRIQUECIDO').length;

  int get _totalConcluidos =>
      _produtos.where((p) => _statusDe(p) == 'CONCLUIDO').length;

  int get _totalComImagem => _produtos.where(_temImagem).length;

  int get _totalSemImagem => _produtos.length - _totalComImagem;

  // ── Lista filtrada ─────────────────────────────────────────
  List<Map<String, dynamic>> get _produtosFiltrados {
    return _produtos.where((p) {
      final passouStatus =
          _filtroStatus == 'TODOS' || _statusDe(p) == _filtroStatus;

      final possuiImagem = _temImagem(p);
      final passouImagem = _filtroImagem == 'TODAS'
          ? true
          : _filtroImagem == 'COM_IMAGEM'
          ? possuiImagem
          : !possuiImagem;

      return passouStatus && passouImagem;
    }).toList();
  }

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  @override
  void dispose() {
    _debounce?.cancel();
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
        queryParameters: {
          if (busca.isNotEmpty) 'busca': busca,

          if (_filtroStatus != 'TODOS') 'status_enriquecimento': _filtroStatus,

          if (_filtroImagem == 'SEM_IMAGEM') 'status_imagem': 'sem_imagem',

          if (_filtroImagem == 'COM_IMAGEM') 'status_imagem': 'com_imagem',

          'pagina': '1',
          'limite': '500',
        },
      );

      final response = await http.get(uri, headers: await _headers);
      if (!mounted) return;

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final produtos = List<Map<String, dynamic>>.from(
          data['produtos'] ?? [],
        );

        setState(() {
          _produtos = produtos;
          _carregando = false;
        });
      } else {
        setState(() => _carregando = false);
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => _carregando = false);
    }
  }

  // Evita uma requisição a cada letra digitada
  void _onBuscaChanged(String v) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      _carregar(busca: v);
    });
  }

  Future<void> _abrirEdicao(Map<String, dynamic> produto) async {
    final atualizou = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AdminEditarProdutoScreen(produto: produto),
      ),
    );

    if (atualizou == true) {
      setState(() {
        _filtroStatus = 'TODOS';
        _filtroImagem = 'TODAS';
      });

      _carregar(busca: _buscaCtrl.text);
    }
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

  String _labelStatus(String status) {
    switch (status) {
      case 'CONCLUIDO':
        return '🟢 Concluído';
      case 'ENRIQUECIDO':
        return '🔵 Enriquecido';
      default:
        return '🟠 Pendente';
    }
  }

  // ── Widgets auxiliares ─────────────────────────────────────
  Widget _chipStatus(String label, String valor) {
    return ChoiceChip(
      label: Text(label),
      selected: _filtroStatus == valor,
      onSelected: (_) {
        setState(() {
          _filtroStatus = valor;
        });

        _carregar(busca: _buscaCtrl.text);
      },
    );
  }

  Widget _chipImagem(String label, String valor) {
    return ChoiceChip(
      label: Text(label),
      selected: _filtroImagem == valor,
      onSelected: (_) {
        setState(() {
          _filtroImagem = valor;
        });

        _carregar(busca: _buscaCtrl.text);
      },
    );
  }

  Widget _buildFiltros() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Status Enriquecimento',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              _chipStatus('Todos (${_produtos.length})', 'TODOS'),
              _chipStatus('Pendente ($_totalPendentes)', 'PENDENTE'),
              _chipStatus('Enriquecido ($_totalEnriquecidos)', 'ENRIQUECIDO'),
              _chipStatus('Concluído ($_totalConcluidos)', 'CONCLUIDO'),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Status Imagem',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              _chipImagem('Todas', 'TODAS'),
              _chipImagem('Sem imagem ($_totalSemImagem)', 'SEM_IMAGEM'),
              _chipImagem('Com imagem ($_totalComImagem)', 'COM_IMAGEM'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildItem(Map<String, dynamic> p) {
    final categoria = p['categoria'] as String? ?? 'Outros';
    final cor = _corCategoria(categoria);

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      clipBehavior: Clip.antiAlias,
      child: ExpansionTile(
        shape: const Border(),
        collapsedShape: const Border(),
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
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Wrap(
            spacing: 6,
            children: [
              Chip(
                visualDensity: VisualDensity.compact,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                label: Text(
                  _labelStatus(_statusDe(p)),
                  style: const TextStyle(fontSize: 11),
                ),
              ),
              Chip(
                visualDensity: VisualDensity.compact,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                label: Text(
                  _temImagem(p) ? '📷 Com imagem' : '⚪ Sem imagem',
                  style: const TextStyle(fontSize: 11),
                ),
              ),
            ],
          ),
        ),
        children: [
          ListTile(title: const Text('Categoria'), subtitle: Text(categoria)),
          ListTile(
            title: const Text('Código de Barras'),
            subtitle: Text(p['codigo_barras'] ?? '-'),
          ),
          ListTile(
            title: const Text('Marca'),
            subtitle: Text(p['marca'] ?? '-'),
          ),
          ListTile(
            title: const Text('Nome Original'),
            subtitle: Text(p['nome_original'] ?? '-'),
          ),
          ListTile(
            title: const Text('Peso'),
            subtitle: Text('${p['peso'] ?? '-'} ${p['unidade_medida'] ?? ''}'),
          ),
          ListTile(
            title: const Text('Mercados / Menor preço'),
            subtitle: Text(
              '${p['total_mercados'] ?? 0} mercados · R\$ ${(double.tryParse(p['menor_preco']?.toString() ?? '0') ?? 0.0).toStringAsFixed(2)}',
            ),
          ),
          if (p['ultima_chave_nfce'] != null)
            ListTile(
              leading: const Icon(Icons.receipt),
              title: const Text('Nota Fiscal de Origem'),
              subtitle: Text(
                p['ultima_chave_nfce'],
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: ElevatedButton.icon(
              icon: const Icon(Icons.edit),
              label: const Text('Editar'),
              onPressed: () => _abrirEdicao(p),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtrados = _produtosFiltrados;

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
              onChanged: _onBuscaChanged,
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

          // ── Filtros ────────────────────────────────────────
          _buildFiltros(),

          // ── Contador ───────────────────────────────────────
          if (!_carregando)
            Padding(
              padding: const EdgeInsets.only(left: 16, top: 12, bottom: 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  '${filtrados.length} de ${_produtos.length} produtos',
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
                : filtrados.isEmpty
                ? const Center(child: Text('Nenhum produto encontrado.'))
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filtrados.length,
                    itemBuilder: (_, i) => _buildItem(filtrados[i]),
                  ),
          ),
        ],
      ),
    );
  }
}
