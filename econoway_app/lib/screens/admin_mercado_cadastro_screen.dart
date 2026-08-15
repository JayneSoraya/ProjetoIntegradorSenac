import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class AdminMercadoCadastroScreen extends StatefulWidget {
  final Map<String, dynamic>? mercado; // null = novo, preenchido = editar
  const AdminMercadoCadastroScreen({super.key, this.mercado});

  @override
  State<AdminMercadoCadastroScreen> createState() =>
      _AdminMercadoCadastroScreenState();
}

class _AdminMercadoCadastroScreenState
    extends State<AdminMercadoCadastroScreen> {
  static const String _baseUrl = 'http://192.168.1.11:3333/api/admin';

  final _formKey = GlobalKey<FormState>();
  bool _salvando = false;
  int _paginaAtual = 0;
  final _pageController = PageController();

  // ── Controllers ────────────────────────────────────────────
  final _nomeCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _telefoneCtrl = TextEditingController();
  final _cnpjCtrl = TextEditingController();
  final _cepCtrl = TextEditingController();
  final _logradouroCtrl = TextEditingController();
  final _numeroCtrl = TextEditingController();
  final _bairroCtrl = TextEditingController();
  final _cidadeCtrl = TextEditingController();
  final _estadoCtrl = TextEditingController();
  final _paisCtrl = TextEditingController();

  // ── Horários ───────────────────────────────────────────────
  TimeOfDay _semanaInicio = const TimeOfDay(hour: 7, minute: 0);
  TimeOfDay _semanaFim = const TimeOfDay(hour: 22, minute: 0);
  TimeOfDay _sabadoInicio = const TimeOfDay(hour: 7, minute: 0);
  TimeOfDay _sabadoFim = const TimeOfDay(hour: 22, minute: 0);
  TimeOfDay _domingoInicio = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay _domingoFim = const TimeOfDay(hour: 20, minute: 0);
  TimeOfDay _feriadoInicio = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay _feriadoFim = const TimeOfDay(hour: 18, minute: 0);

  final List<String> _paginas = [
    'Informações Gerais',
    'Endereço',
    'Horários',
    'Imagens',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.mercado != null) _preencherEdicao();
    _paisCtrl.text = 'Brasil';
  }

  void _preencherEdicao() {
    final m = widget.mercado!;
    _nomeCtrl.text = m['nome_fantasia'] ?? '';
    _emailCtrl.text = m['email'] ?? '';
    _telefoneCtrl.text = m['telefone'] ?? '';
    _cnpjCtrl.text = m['cnpj'] ?? '';
    _cepCtrl.text = m['cep'] ?? '';
    _logradouroCtrl.text = m['logradouro'] ?? '';
    _numeroCtrl.text = m['numero'] ?? '';
    _bairroCtrl.text = m['bairro'] ?? '';
    _cidadeCtrl.text = m['cidade'] ?? '';
    _estadoCtrl.text = m['estado'] ?? '';
    _paisCtrl.text = m['pais'] ?? 'Brasil';
  }

  @override
  void dispose() {
    _pageController.dispose();
    _nomeCtrl.dispose();
    _emailCtrl.dispose();
    _telefoneCtrl.dispose();
    _cnpjCtrl.dispose();
    _cepCtrl.dispose();
    _logradouroCtrl.dispose();
    _numeroCtrl.dispose();
    _bairroCtrl.dispose();
    _cidadeCtrl.dispose();
    _estadoCtrl.dispose();
    _paisCtrl.dispose();
    super.dispose();
  }

  // ── Busca endereço pelo CEP ────────────────────────────────
  Future<void> _buscarCep() async {
    final cep = _cepCtrl.text.replaceAll(RegExp(r'\D'), '');
    if (cep.length != 8) return;

    try {
      final response = await http.get(
        Uri.parse('https://viacep.com.br/ws/$cep/json/',
        ),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['erro'] == null) {
          setState(() {
            _logradouroCtrl.text = data['logradouro'] ?? '';
            _bairroCtrl.text = data['bairro'] ?? '';
            _cidadeCtrl.text = data['localidade'] ?? '';
            _estadoCtrl.text = data['uf'] ?? '';
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Endereço preenchido automaticamente!'),
            ),
          );
        }
      }
    } catch (_) {}
  }

  Future<void> _selecionarHorario(
    String label,
    TimeOfDay atual,
    void Function(TimeOfDay) onSelecionado,
  ) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: atual,
      helpText: label,
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
        child: child!,
      ),
    );
    if (picked != null) setState(() => onSelecionado(picked));
  }

  String _formatarHora(TimeOfDay t) =>
      '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';

  // ── Salvar ─────────────────────────────────────────────────
  Future<void> _salvar() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _salvando = true);

    final token = await AuthService.getToken();
    final body = jsonEncode({
      'cnpj': _cnpjCtrl.text,
      'nome_fantasia': _nomeCtrl.text,
      'endereco_completo':
          '${_logradouroCtrl.text}, ${_numeroCtrl.text}, ${_bairroCtrl.text}, ${_cidadeCtrl.text}, ${_estadoCtrl.text}',
      'email': _emailCtrl.text,
      'telefone': _telefoneCtrl.text,
      'cep': _cepCtrl.text,
      'logradouro': _logradouroCtrl.text,
      'numero': _numeroCtrl.text,
      'bairro': _bairroCtrl.text,
      'cidade': _cidadeCtrl.text,
      'estado': _estadoCtrl.text,
      'pais': _paisCtrl.text,
      'horario_semana_inicio': _formatarHora(_semanaInicio),
      'horario_semana_fim': _formatarHora(_semanaFim),
      'horario_sabado_inicio': _formatarHora(_sabadoInicio),
      'horario_sabado_fim': _formatarHora(_sabadoFim),
      'horario_domingo_inicio': _formatarHora(_domingoInicio),
      'horario_domingo_fim': _formatarHora(_domingoFim),
      'horario_feriado_inicio': _formatarHora(_feriadoInicio),
      'horario_feriado_fim': _formatarHora(_feriadoFim),
    });

    final isEdicao = widget.mercado != null;
    final url = isEdicao
        ? '$_baseUrl/mercados/${widget.mercado!['id_supermercado']}'
        : '$_baseUrl/mercados';

    final response = isEdicao
        ? await http.put(
            Uri.parse(url),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: body,
          )
        : await http.post(
            Uri.parse(url),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: body,
          );

    setState(() => _salvando = false);
    if (!mounted) return;

    if (response.statusCode == 200 || response.statusCode == 201) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isEdicao ? 'Mercado atualizado!' : 'Mercado cadastrado!',
          ),
        ),
      );
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Erro: ${response.body}')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdicao = widget.mercado != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEdicao ? 'Editar Mercado' : 'Novo Mercado'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            // ── Indicador de progresso ──────────────────────
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    children: List.generate(
                      _paginas.length,
                      (i) => Expanded(
                        child: Container(
                          height: 4,
                          margin: EdgeInsets.only(
                            right: i < _paginas.length - 1 ? 4 : 0,
                          ),
                          decoration: BoxDecoration(
                            color: i <= _paginaAtual
                                ? AppColors.primary
                                : Colors.grey.shade200,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _paginas[_paginaAtual],
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                      Text(
                        '${_paginaAtual + 1}/${_paginas.length}',
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

            // ── Conteúdo ────────────────────────────────────
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildPaginaGeral(),
                  _buildPaginaEndereco(),
                  _buildPaginaHorarios(),
                  _buildPaginaImagens(),
                ],
              ),
            ),

            // ── Botões de navegação ─────────────────────────
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  if (_paginaAtual > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          _pageController.previousPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                          setState(() => _paginaAtual--);
                        },
                        child: const Text('Voltar'),
                      ),
                    ),
                  if (_paginaAtual > 0) const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: _salvando
                          ? null
                          : () {
                              if (_paginaAtual < _paginas.length - 1) {
                                _pageController.nextPage(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                );
                                setState(() => _paginaAtual++);
                              } else {
                                _salvar();
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _salvando
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : Text(
                              _paginaAtual < _paginas.length - 1
                                  ? 'Próximo'
                                  : 'Salvar',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Página 1 — Informações Gerais ──────────────────────────
  Widget _buildPaginaGeral() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          _campo(
            controller: _nomeCtrl,
            label: '🏪 Nome Fantasia',
            obrigatorio: true,
          ),
          _campo(
            controller: _cnpjCtrl,
            label: '📋 CNPJ',
            obrigatorio: true,
            hint: '00.000.000/0000-00',
          ),
          _campo(
            controller: _emailCtrl,
            label: '📧 Email',
            tipo: TextInputType.emailAddress,
          ),
          _campo(
            controller: _telefoneCtrl,
            label: '📞 Telefone',
            tipo: TextInputType.phone,
            hint: '(00) 00000-0000',
          ),
        ],
      ),
    );
  }

  // ── Página 2 — Endereço ────────────────────────────────────
  Widget _buildPaginaEndereco() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _campo(
                  controller: _cepCtrl,
                  label: '📮 CEP',
                  hint: '00000-000',
                  tipo: TextInputType.number,
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: _buscarCep,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.secondary,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Buscar'),
              ),
            ],
          ),
          _campo(controller: _logradouroCtrl, label: '🛣 Logradouro'),
          _campo(controller: _numeroCtrl, label: '🔢 Número'),
          _campo(controller: _bairroCtrl, label: '🏘 Bairro'),
          _campo(controller: _cidadeCtrl, label: '🏙 Cidade'),
          Row(
            children: [
              SizedBox(
                width: 100,
                child: _campo(
                  controller: _estadoCtrl,
                  label: '🗺 UF',
                  hint: 'SP',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _campo(controller: _paisCtrl, label: '🌎 País'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.secondary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.secondary.withOpacity(0.3)),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: AppColors.secondary, size: 18),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Latitude e Longitude serão calculadas automaticamente pelo CEP.',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Página 3 — Horários ────────────────────────────────────
  Widget _buildPaginaHorarios() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          _blocoHorario(
            '🕒 Segunda a Sexta',
            _semanaInicio,
            _semanaFim,
            (t) => _semanaInicio = t,
            (t) => _semanaFim = t,
          ),
          _blocoHorario(
            '🕒 Sábado',
            _sabadoInicio,
            _sabadoFim,
            (t) => _sabadoInicio = t,
            (t) => _sabadoFim = t,
          ),
          _blocoHorario(
            '🕒 Domingo',
            _domingoInicio,
            _domingoFim,
            (t) => _domingoInicio = t,
            (t) => _domingoFim = t,
          ),
          _blocoHorario(
            '🕒 Feriados',
            _feriadoInicio,
            _feriadoFim,
            (t) => _feriadoInicio = t,
            (t) => _feriadoFim = t,
          ),
        ],
      ),
    );
  }

  Widget _blocoHorario(
    String label,
    TimeOfDay inicio,
    TimeOfDay fim,
    void Function(TimeOfDay) onInicio,
    void Function(TimeOfDay) onFim,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _botaoHorario(
                  'Abertura',
                  inicio,
                  () =>
                      _selecionarHorario('Abertura — $label', inicio, onInicio),
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Text('até', style: TextStyle(color: Colors.grey)),
              ),
              Expanded(
                child: _botaoHorario(
                  'Fechamento',
                  fim,
                  () => _selecionarHorario('Fechamento — $label', fim, onFim),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _botaoHorario(String label, TimeOfDay hora, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.primary.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: const TextStyle(color: Colors.grey, fontSize: 11),
            ),
            const SizedBox(height: 4),
            Text(
              _formatarHora(hora),
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Página 4 — Imagens ─────────────────────────────────────
  Widget _buildPaginaImagens() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          _cardImagem(
            icone: Icons.store,
            titulo: '🏪 Logo do Mercado',
            descricao: 'Imagem quadrada, mínimo 200×200px',
          ),
          const SizedBox(height: 16),
          _cardImagem(
            icone: Icons.panorama,
            titulo: '🖼 Foto de Capa',
            descricao: 'Imagem horizontal, mínimo 1200×400px',
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.orange.shade200),
            ),
            child: const Row(
              children: [
                Icon(
                  Icons.rocket_launch_outlined,
                  color: Colors.orange,
                  size: 20,
                ),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Upload de imagens disponível na próxima versão. Por ora salve sem imagem.',
                    style: TextStyle(color: Colors.orange, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _cardImagem({
    required IconData icone,
    required String titulo,
    required String descricao,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.primary.withOpacity(0.2),
          style: BorderStyle.solid,
        ),
      ),
      child: Column(
        children: [
          Icon(icone, size: 48, color: Colors.grey.shade300),
          const SizedBox(height: 12),
          Text(titulo, style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(
            descricao,
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: null,
            icon: const Icon(Icons.upload),
            label: const Text('Selecionar imagem'),
          ),
        ],
      ),
    );
  }

  Widget _campo({
    required TextEditingController controller,
    required String label,
    String? hint,
    TextInputType tipo = TextInputType.text,
    bool obrigatorio = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        keyboardType: tipo,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          filled: true,
          fillColor: Colors.grey.shade50,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
        ),
        validator: obrigatorio
            ? (v) => (v == null || v.isEmpty) ? 'Campo obrigatório' : null
            : null,
      ),
    );
  }
}
