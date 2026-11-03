import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../core/network/api_client.dart';
import '../services/viacep_service.dart';

class EditarMercadoScreen extends StatefulWidget {
  final Map<String, dynamic> mercado;

  const EditarMercadoScreen({super.key, required this.mercado});

  @override
  State<EditarMercadoScreen> createState() => _EditarMercadoScreenState();
}

class _EditarMercadoScreenState extends State<EditarMercadoScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _salvando = false;
  int _paginaAtual = 0;
  final _pageController = PageController();

  // ── Controllers ────────────────────────────────────────────
  late final TextEditingController _nomeCtrl;
  late final TextEditingController _emailCtrl;
  late final TextEditingController _telefoneCtrl;
  late final TextEditingController _cnpjCtrl;
  late final TextEditingController _cepCtrl;
  late final TextEditingController _logradouroCtrl;
  late final TextEditingController _numeroCtrl;
  late final TextEditingController _bairroCtrl;
  late final TextEditingController _cidadeCtrl;
  late final TextEditingController _estadoCtrl;
  late final TextEditingController _paisCtrl;

  // ── Horários ───────────────────────────────────────────────
  late TimeOfDay _semanaInicio;
  late TimeOfDay _semanaFim;
  late TimeOfDay _sabadoInicio;
  late TimeOfDay _sabadoFim;
  late TimeOfDay _domingoInicio;
  late TimeOfDay _domingoFim;
  late TimeOfDay _feriadoInicio;
  late TimeOfDay _feriadoFim;

  final List<String> _paginas = ['Informações Gerais', 'Endereço', 'Horários'];

  @override
  void initState() {
    super.initState();
    final m = widget.mercado;

    _nomeCtrl = TextEditingController(
      text: m['nome_fantasia'] ?? m['nome'] ?? '',
    );
    _emailCtrl = TextEditingController(text: m['email'] ?? '');
    _telefoneCtrl = TextEditingController(text: m['telefone'] ?? '');
    _cnpjCtrl = TextEditingController(text: m['cnpj'] ?? '');
    _cepCtrl = TextEditingController(text: m['cep'] ?? '');
    _logradouroCtrl = TextEditingController(
      text: m['logradouro'] ?? m['endereco'] ?? '',
    );
    _numeroCtrl = TextEditingController(text: m['numero'] ?? '');
    _bairroCtrl = TextEditingController(text: m['bairro'] ?? '');
    _cidadeCtrl = TextEditingController(text: m['cidade'] ?? '');
    _estadoCtrl = TextEditingController(text: m['estado'] ?? '');
    _paisCtrl = TextEditingController(text: m['pais'] ?? 'Brasil');

    // Converte horários salvos (se existirem) ou usa padrões
    _semanaInicio = _parseHora(m['horario_semana_inicio'], 7, 0);
    _semanaFim = _parseHora(m['horario_semana_fim'], 22, 0);
    _sabadoInicio = _parseHora(m['horario_sabado_inicio'], 7, 0);
    _sabadoFim = _parseHora(m['horario_sabado_fim'], 22, 0);
    _domingoInicio = _parseHora(m['horario_domingo_inicio'], 8, 0);
    _domingoFim = _parseHora(m['horario_domingo_fim'], 20, 0);
    _feriadoInicio = _parseHora(m['horario_feriado_inicio'], 8, 0);
    _feriadoFim = _parseHora(m['horario_feriado_fim'], 18, 0);
  }

  TimeOfDay _parseHora(String? horaStr, int hPadrao, int mPadrao) {
    if (horaStr == null || !horaStr.contains(':')) {
      return TimeOfDay(hour: hPadrao, minute: mPadrao);
    }
    final partes = horaStr.split(':');
    return TimeOfDay(
      hour: int.tryParse(partes[0]) ?? hPadrao,
      minute: int.tryParse(partes[1]) ?? mPadrao,
    );
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

  Future<void> _buscarCep() async {
    final cepLimpo = _cepCtrl.text.trim();
    if (cepLimpo.length < 8) return;

    final dadosCep = await ViaCepService.buscarCep(cepLimpo);

    if (!mounted) return;

    if (dadosCep != null && !dadosCep.containsKey('erro')) {
      setState(() {
        _logradouroCtrl.text = dadosCep['logradouro'] ?? '';
        _bairroCtrl.text = dadosCep['bairro'] ?? '';
        _cidadeCtrl.text = dadosCep['localidade'] ?? '';
        _estadoCtrl.text = dadosCep['uf'] ?? '';
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Endereço encontrado e preenchido!'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 2),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('CEP não encontrado.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
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

  Future<void> _salvarAlteracoes() async {
    print('🔵 1. Botão de guardar pressionado!');

    // 1. Valida o formulário visual
    if (!_formKey.currentState!.validate()) {
      print('❌ 2. Validação do formulário falhou.');
      return;
    }

    // 2. Verifica se o ID do mercado existe para evitar crashes
    final idMercado = widget.mercado['id_mercado'] ?? widget.mercado['id'];
    if (idMercado == null) {
      print('❌ ERRO CRÍTICO: O ID do mercado é nulo!');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erro: ID do mercado não encontrado.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    print('✅ ID do mercado detetado: $idMercado');
    setState(() => _salvando = true);

    try {
      final url = '/supermercados/$idMercado';
      print('🔍 A enviar dados para o URL: $url');
      print('DADOS DO MERCADO: ${widget.mercado}');
      print('ID ENCONTRADO: $idMercado');
      await ApiClient.put(
        url,
        body: {
          'nome_fantasia': _nomeCtrl.text.trim(),
          'cnpj': _cnpjCtrl.text.trim(),
          'email': _emailCtrl.text.trim(),
          'telefone': _telefoneCtrl.text.trim(),
          'cep': _cepCtrl.text.trim(),
          'logradouro': _logradouroCtrl.text.trim(),
          'numero': _numeroCtrl.text.trim(),
          'bairro': _bairroCtrl.text.trim(),
          'cidade': _cidadeCtrl.text.trim(),
          'estado': _estadoCtrl.text.trim(),
          'pais': _paisCtrl.text.trim(),
          'horario_semana_inicio': _formatarHora(_semanaInicio),
          'horario_semana_fim': _formatarHora(_semanaFim),
          'horario_sabado_inicio': _formatarHora(_sabadoInicio),
          'horario_sabado_fim': _formatarHora(_sabadoFim),
          'horario_domingo_inicio': _formatarHora(_domingoInicio),
          'horario_domingo_fim': _formatarHora(_domingoFim),
          'horario_feriado_inicio': _formatarHora(_feriadoInicio),
          'horario_feriado_fim': _formatarHora(_feriadoFim),
        },
      );

      print('🚀 Dados guardados com sucesso!');

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Dados atualizados com sucesso!'),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pop(context, true);
    } catch (e) {
      print('⚠️ Erro capturado no envio: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro ao atualizar: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    } finally {
      if (mounted) setState(() => _salvando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Editar Meu Mercado'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            // Indicador de passos
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
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
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildPaginaGeral(),
                  _buildPaginaEndereco(),
                  _buildPaginaHorarios(),
                ],
              ),
            ),
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
                              print(
                                '🎯 CLIQUE NO BOTÃO! Página atual: $_paginaAtual | Total de páginas: ${_paginas.length}',
                              );
                              if (_paginaAtual < _paginas.length - 1) {
                                print('➡️ A avançar página...');
                                _pageController.nextPage(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                );
                                setState(() => _paginaAtual++);
                              } else {
                                print('💾 A chamar _salvarAlteracoes() agora!');
                                _salvarAlteracoes();
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: _salvando
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Text(
                              _paginaAtual < _paginas.length - 1
                                  ? 'Próximo'
                                  : 'Salvar Alterações',
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

  Widget _buildPaginaGeral() => SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(
      children: [
        _campo(
          controller: _nomeCtrl,
          label: 'Nome Fantasia',
          obrigatorio: true,
        ),
        _campo(controller: _cnpjCtrl, label: 'CNPJ', obrigatorio: true),
        _campo(
          controller: _emailCtrl,
          label: 'Email',
          tipo: TextInputType.emailAddress,
        ),
        _campo(
          controller: _telefoneCtrl,
          label: 'Telefone',
          tipo: TextInputType.phone,
        ),
      ],
    ),
  );

  Widget _buildPaginaEndereco() => SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _campo(
                controller: _cepCtrl,
                label: 'CEP',
                tipo: TextInputType.number,
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: _buscarCep,
              child: const Text('Buscar CEP'),
            ),
          ],
        ),
        _campo(controller: _logradouroCtrl, label: 'Logradouro'),
        _campo(controller: _numeroCtrl, label: 'Número'),
        _campo(controller: _bairroCtrl, label: 'Bairro'),
        _campo(controller: _cidadeCtrl, label: 'Cidade'),
        _campo(controller: _estadoCtrl, label: 'Estado (UF)'),
      ],
    ),
  );

  Widget _buildPaginaHorarios() => SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(
      children: [
        _blocoHorario(
          'Segunda a Sexta',
          _semanaInicio,
          _semanaFim,
          (t) => _semanaInicio = t,
          (t) => _semanaFim = t,
        ),
        _blocoHorario(
          'Sábado',
          _sabadoInicio,
          _sabadoFim,
          (t) => _sabadoInicio = t,
          (t) => _sabadoFim = t,
        ),
        _blocoHorario(
          'Domingo',
          _domingoInicio,
          _domingoFim,
          (t) => _domingoInicio = t,
          (t) => _domingoFim = t,
        ),
        _blocoHorario(
          'Feriados',
          _feriadoInicio,
          _feriadoFim,
          (t) => _feriadoInicio = t,
          (t) => _feriadoFim = t,
        ),
      ],
    ),
  );

  Widget _blocoHorario(
    String label,
    TimeOfDay inicio,
    TimeOfDay fim,
    void Function(TimeOfDay) onInicio,
    void Function(TimeOfDay) onFim,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () =>
                        _selecionarHorario('Abertura', inicio, onInicio),
                    child: Text('Abertura: ${_formatarHora(inicio)}'),
                  ),
                ),
                const Text('até'),
                Expanded(
                  child: TextButton(
                    onPressed: () =>
                        _selecionarHorario('Fechamento', fim, onFim),
                    child: Text('Fechamento: ${_formatarHora(fim)}'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _campo({
    required TextEditingController controller,
    required String label,
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
          border: const OutlineInputBorder(),
        ),
        validator: obrigatorio
            ? (v) => (v == null || v.isEmpty) ? 'Campo obrigatório' : null
            : null,
      ),
    );
  }
}
