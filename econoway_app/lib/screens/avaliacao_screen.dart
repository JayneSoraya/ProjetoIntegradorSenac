import 'package:flutter/material.dart';

class AvaliacaoScreen extends StatefulWidget {
  final String nomeMercado;

  const AvaliacaoScreen({super.key, required this.nomeMercado});

  @override
  State<AvaliacaoScreen> createState() => _AvaliacaoScreenState();
}

class _AvaliacaoScreenState extends State<AvaliacaoScreen> {
  double _nota = 3;
  bool _enviado = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Avaliar ${widget.nomeMercado}')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: _enviado ? _buildConfirmacao() : _buildFormulario(),
      ),
    );
  }

  Widget _buildFormulario() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Icon(Icons.store_outlined, size: 64, color: Colors.green),
        const SizedBox(height: 16),
        Text(
          'Como foi sua experiência no ${widget.nomeMercado}?',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 32),
        Text(
          'Nota: ${_nota.toStringAsFixed(1)}',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.green,
          ),
        ),
        Slider(
          value: _nota,
          min: 0,
          max: 10,
          divisions: 20,
          activeColor: Colors.green,
          onChanged: (v) => setState(() => _nota = v),
        ),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: () => setState(() => _enviado = true),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: const Text(
            'Enviar avaliação',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }

  Widget _buildConfirmacao() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Icon(Icons.check_circle_outline, size: 80, color: Colors.green),
        const SizedBox(height: 24),
        const Text(
          'Obrigado pela avaliação!',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        const Text(
          'Sua opinião ajuda outros usuários a economizar.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey, fontSize: 15),
        ),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: () => Navigator.popUntil(context, (r) => r.isFirst),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: const Text('Voltar ao início'),
        ),
      ],
    );
  }
}
