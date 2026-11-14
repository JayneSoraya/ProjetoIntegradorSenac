import 'package:econoway_app/core/network/api_client.dart';
import 'package:flutter/material.dart';
import '../utils/imagem_utils.dart';

class AdminEditarProdutoScreen extends StatefulWidget {
  final Map<String, dynamic> produto;

  const AdminEditarProdutoScreen({super.key, required this.produto});

  @override
  State<AdminEditarProdutoScreen> createState() =>
      _AdminEditarProdutoScreenState();
}

class _AdminEditarProdutoScreenState extends State<AdminEditarProdutoScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nomeProdutoController;
  late TextEditingController _marcaController;
  late TextEditingController _pesoController;
  late TextEditingController _unidadeController;
  late TextEditingController _imagemUrlController;

  bool _salvando = false;

  String _statusEnriquecimento = "PENDENTE";
  late String _categoriaSelecionada;

  static const List<String> categorias = [
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

    _nomeProdutoController = TextEditingController(
      text: widget.produto['nome_produto'] ?? '',
    );

    _marcaController = TextEditingController(
      text: widget.produto['marca'] ?? '',
    );

    _pesoController = TextEditingController(
      text: widget.produto['peso']?.toString() ?? '',
    );

    _unidadeController = TextEditingController(
      text: widget.produto['unidade_medida'] ?? '',
    );

    _imagemUrlController = TextEditingController(
      text: widget.produto['imagem_url'] ?? '',
    );

    _statusEnriquecimento =
        widget.produto['status_enriquecimento'] ?? 'PENDENTE';

    _categoriaSelecionada = widget.produto['categoria'] ?? 'Outros';

    if (!categorias.contains(_categoriaSelecionada)) {
      _categoriaSelecionada = 'Outros';
    }
  }

  @override
  void dispose() {
    _nomeProdutoController.dispose();
    _marcaController.dispose();
    _pesoController.dispose();
    _unidadeController.dispose();
    _imagemUrlController.dispose();
    super.dispose();
  }

  Color getStatusColor() {
    switch (_statusEnriquecimento) {
      case 'CONCLUIDO':
        return Colors.green;
      case 'ENRIQUECIDO':
        return Colors.blue;
      default:
        return Colors.orange;
    }
  }

  String getStatusLabel() {
    switch (_statusEnriquecimento) {
      case 'CONCLUIDO':
        return '🟢 Concluído';
      case 'ENRIQUECIDO':
        return '🔵 Enriquecido';
      default:
        return '🟠 Pendente';
    }
  }

  Future<void> _salvarAlteracoes() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _salvando = true;
    });

    try {
      final idProduto = widget.produto['id_produto'];
      await ApiClient.put(
        '/admin/produtos/$idProduto',
        body: {
          'nome_produto': _nomeProdutoController.text.trim(),
          'marca': _marcaController.text.trim(),
          'categoria': _categoriaSelecionada,
          'peso': _pesoController.text.isNotEmpty
              ? double.tryParse(_pesoController.text.replaceAll(',', '.'))
              : null,
          'unidade_medida': _unidadeController.text.trim(),
          'imagem_url': _imagemUrlController.text.trim().isNotEmpty
              ? _imagemUrlController.text.trim()
              : null,
          'status_enriquecimento':
              _statusEnriquecimento,
        },
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Produto atualizado com sucesso!'),
          backgroundColor: Colors.green,
        ),
        
      );
      
      Navigator.pop(context, true);
      
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro ao salvar: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _salvando = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final String imagemAtual = _imagemUrlController.text.isNotEmpty
        ? _imagemUrlController.text
        : (widget.produto['imagem_url'] ??
              obterPlaceholderPorCategoria(_categoriaSelecionada));

    final bool possuiImagem = imagemAtual.isNotEmpty;

    return Scaffold(
      appBar: AppBar(
        title: Text('Editar Produto #${widget.produto['id_produto']}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      Chip(
                        backgroundColor: getStatusColor().withValues(
                          alpha: 0.15,
                        ),
                        label: Text(getStatusLabel()),
                      ),
                      Chip(
                        avatar: Icon(
                          possuiImagem
                              ? Icons.image
                              : Icons.image_not_supported,
                        ),
                        label: Text(
                          possuiImagem ? '📷 Com imagem' : '⚪ Sem imagem',
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    imagemAtual,
                    fit: BoxFit.cover,
                    errorBuilder: (_, _, _) {
                      return const Icon(Icons.broken_image, size: 48);
                    },
                  ),
                ),
              ),

              const SizedBox(height: 8),

              Text(
                _imagemUrlController.text.isNotEmpty
                    ? 'Imagem personalizada'
                    : 'Placeholder automático da categoria',
                style: TextStyle(color: Colors.grey.shade600),
              ),

              const SizedBox(height: 24),

              TextFormField(
                controller: _imagemUrlController,
                decoration: const InputDecoration(
                  labelText: 'URL da imagem',
                  prefixIcon: Icon(Icons.link),
                  border: OutlineInputBorder(),
                ),
                onChanged: (_) => setState(() {}),
              ),

              const SizedBox(height: 16),

              TextFormField(
                initialValue: widget.produto['codigo_barras'] ?? '',
                readOnly: true,
                decoration: InputDecoration(
                  labelText: 'Código de Barras',
                  border: const OutlineInputBorder(),
                  filled: true,
                  fillColor: Colors.grey.shade100,
                ),
              ),

              const SizedBox(height: 16),

              TextFormField(
                initialValue: widget.produto['nome_original'] ?? '',
                readOnly: true,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: 'Nome Original da NFC-e',
                  border: const OutlineInputBorder(),
                  filled: true,
                  fillColor: Colors.grey.shade100,
                ),
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _nomeProdutoController,
                decoration: const InputDecoration(
                  labelText: 'Nome Comercial',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Campo obrigatório';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                initialValue: _statusEnriquecimento,
                decoration: const InputDecoration(
                  labelText: 'Status de Enriquecimento',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(
                    value: 'PENDENTE',
                    child: Text('🟠 Pendente'),
                  ),
                  DropdownMenuItem(
                    value: 'ENRIQUECIDO',
                    child: Text('🔵 Enriquecido'),
                  ),
                  DropdownMenuItem(
                    value: 'CONCLUIDO',
                    child: Text('🟢 Concluído'),
                  ),
                ],
                onChanged: (value) {
                  setState(() {
                    _statusEnriquecimento = value ?? 'PENDENTE';
                  });
                },
              ),

              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _marcaController,
                      decoration: const InputDecoration(
                        labelText: 'Marca',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),

                  const SizedBox(width: 12),

                  Expanded(
                    child: DropdownButtonFormField<String>(
                      isExpanded: true,
                      initialValue: _categoriaSelecionada,
                      decoration: const InputDecoration(
                        labelText: 'Categoria',
                        border: OutlineInputBorder(),
                      ),
                      items: categorias.map((categoria) => DropdownMenuItem<String>(
                          value: categoria,
                          child: Text(categoria),
                        ),
                      ).toList(),
                      onChanged: (value) {
                        setState(() {
                          _categoriaSelecionada = value!;
                        });
                      },
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _pesoController,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      decoration: const InputDecoration(
                        labelText: 'Peso',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _unidadeController,
                      decoration: const InputDecoration(
                        labelText: 'Unidade',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              Card(
                color: Colors.blue.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.receipt_long, color: Colors.blue),
                          SizedBox(width: 8),
                          Text(
                            'Auditoria de Origem',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Total de notas vinculadas: ${widget.produto['total_notas'] ?? 0}',
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Última chave NFC-e:',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        widget.produto['ultima_chave_nfce'] ?? 'N/A',
                        style: const TextStyle(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 32),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      child: const Text('Cancelar'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _salvando ? null : _salvarAlteracoes,
                      child: _salvando
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Salvar Alterações'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
