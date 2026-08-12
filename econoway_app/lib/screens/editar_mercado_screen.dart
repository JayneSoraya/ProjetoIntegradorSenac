import 'package:econoway_app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import '../services/mercado_service.dart';
import '../services/viacep_service.dart';

class EditarMercadoScreen extends StatefulWidget {
  const EditarMercadoScreen({super.key});

  @override
  State<EditarMercadoScreen> createState() => _EditarMercadoScreenState();
}

class _EditarMercadoScreenState extends State<EditarMercadoScreen> {
  final nomeController = TextEditingController();

  final enderecoController = TextEditingController();

  final telefoneController = TextEditingController();

  final cepController = TextEditingController();

  final logradouroController = TextEditingController();

  final numeroController = TextEditingController();

  final bairroController = TextEditingController();

  final cidadeController = TextEditingController();

  final estadoController = TextEditingController();

  final paisController = TextEditingController();

  final emailController = TextEditingController();

  bool carregando = true;

  Future<void> buscarCep() async {
    final cep = cepController.text.trim();

    if (cep.isEmpty) return;

    try {
      final dados = await ViaCepService.buscarCep(cep);

      if (dados == null) return;

      logradouroController.text = dados['logradouro'] ?? '';

      bairroController.text = dados['bairro'] ?? '';

      cidadeController.text = dados['localidade'] ?? '';

      estadoController.text = dados['uf'] ?? '';

      paisController.text = 'Brasil';
    } catch (e) {
      debugPrint('Erro ao buscar CEP: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    Future<void> carregarDados() async {
      try {
        final dados = await MercadoService.obterPerfil();

        nomeController.text = dados['nome_fantasia'] ?? '';
        telefoneController.text = dados['telefone'] ?? '';
        emailController.text = dados['email'] ?? '';
        cepController.text = dados['cep'] ?? '';
        logradouroController.text = dados['logradouro'] ?? '';
        numeroController.text = dados['numero'] ?? '';
        bairroController.text = dados['bairro'] ?? '';
        cidadeController.text = dados['cidade'] ?? '';
        estadoController.text = dados['estado'] ?? '';
        paisController.text = dados['pais'] ?? '';

        setState(() {
          carregando = false;
        });
      } catch (e) {
        debugPrint(e.toString());

        setState(() {
          carregando = false;
        });
      }
    }

    carregarDados();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Editar Mercado')),
      body: carregando
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  TextField(
                    controller: nomeController,
                    decoration: campoDecoracao('Nome do mercado', Icons.store),
                  ),

                  const SizedBox(height: 16),
                  TextField(
                    controller: telefoneController,
                    decoration: campoDecoracao('Telefone', Icons.phone),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: emailController,
                    decoration: campoDecoracao('Email', Icons.email),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: cepController,
                    onEditingComplete: () {
                      buscarCep();
                    },

                    decoration: campoDecoracao('Cep', Icons.location_on),
                  ),

                  const SizedBox(height: 16),
                  TextField(
                    controller: logradouroController,
                    decoration: campoDecoracao('Logradouro', Icons.route),
                  ),

                  const SizedBox(height: 16),
                  TextField(
                    controller: numeroController,
                    decoration: campoDecoracao('Número', Icons.numbers),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: bairroController,
                    decoration: campoDecoracao(
                      'Bairro',
                      Icons.location_city_rounded,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: cidadeController,
                    decoration: campoDecoracao('Cidade', Icons.apartment),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: estadoController,
                    decoration: campoDecoracao('Estado', Icons.map),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: paisController,
                    decoration: campoDecoracao('Pais', Icons.public),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: paisController,
                    decoration: campoDecoracao('Pais', Icons.public),
                  ),

                  const SizedBox(height: 30),
                  ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Dados salvos com sucesso'),
                        ),
                      );
                    },
                    child: const Text('Salvar'),
                  ),
                ],
              ),
            ),
    );
  }

  InputDecoration campoDecoracao(String titulo, IconData icone) {
    return InputDecoration(
      labelText: titulo,

      prefixIcon: Icon(icone),

      filled: true,

      fillColor: AppColors.secondary,

      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}
