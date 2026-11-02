import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../core/config/app_config.dart';

class ScanNotaScreen extends StatefulWidget {
  const ScanNotaScreen({super.key});

  @override
  State<ScanNotaScreen> createState() => _ScanNotaScreenState();
}

class _ScanNotaScreenState extends State<ScanNotaScreen> {
  final MobileScannerController _scanner = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
  );
  bool _processando = false;
  bool _escaneado = false;

  @override
  void dispose() {
    _scanner.dispose();
    super.dispose();
  }

  Future<void> _processarQrCode(String urlQrCode) async {
    if (_processando || _escaneado) return;

    setState(() {
      _processando = true;
      _escaneado = true;
    });

    await _scanner.stop();

    try {
      final token = await AuthService.getToken();
      final urlEndpoint = AppConfig.endpoint('/notas/processar');

      final response = await http
          .post(
            urlEndpoint,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: jsonEncode({'url_qrcode': urlQrCode}),
          )
          .timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);

      if (!mounted) return;

      if (response.statusCode == 200 || response.statusCode == 201) {
        _mostrarSucesso(data);
      } else {
        _mostrarErro(data['erro'] ?? 'Erro ao processar nota.');
      }
    } catch (e) {
      if (!mounted) return;
      _mostrarErro('Não foi possível conectar ao servidor.');
    }
    if (!mounted) return;

    setState(() => _processando = false);
  }

  void _mostrarSucesso(Map<String, dynamic> data) {
    bool emContingencia = data['contingencia'] ?? false;
    String mensagem = data['mensagem'] ?? 'Nota processada com sucesso!';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          emContingencia ? '⚠️ Nota em Contingência' : '🎉 Compra Registrada!',
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(mensagem),
            const SizedBox(height: 10),
            if (!emContingencia) ...[
              Text('Supermercado: ${data['supermercado']}'),
              Text('Produtos salvos: ${data['produtos_salvos']}'),
            ] else ...[
              Text('Valor Total: R\$ ${data['valor_total']}'),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _escaneado = false;
                _processando = false;
              });
              _scanner.start();
            },
            child: const Text('Escanear outra nota'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _mostrarErro(String mensagem) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.error_outline, color: Colors.red),
            SizedBox(width: 8),
            Text('Erro'),
          ],
        ),
        content: Text(mensagem),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _escaneado = false;
                _processando = false;
              });
              _scanner.start();
            },
            child: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Escanear Nota Fiscal'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.flashlight_on),
            onPressed: () => _scanner.toggleTorch(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _scanner,
            fit: BoxFit.cover,
            onDetect: (capture) {
              final barcode = capture.barcodes.firstOrNull;
              final url = barcode?.rawValue;

              if (url != null && url.isNotEmpty) {
                _processarQrCode(url);
              }
            },
          ),
          Center(
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.secondary, width: 3),
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          Positioned(
            bottom: 60,
            left: 0,
            right: 0,
            child: Column(
              children: [
                if (_processando)
                  const CircularProgressIndicator(color: Colors.white)
                else
                  const Icon(
                    Icons.qr_code_scanner,
                    color: Colors.white,
                    size: 32,
                  ),
                const SizedBox(height: 12),
                Text(
                  _processando
                      ? 'Processando nota...'
                      : 'Aponte para o QR Code\nda nota fiscal',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    shadows: [Shadow(blurRadius: 4, color: Colors.black)],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
