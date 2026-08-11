import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../services/nota_service.dart';
import '../theme/app_theme.dart';

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
      final data = await NotaService.processar(urlQrCode);
      if (!mounted) return;
      _mostrarSucesso(data);
    } catch (e) {
      debugPrint('Falha ao processar NFC-e: $e');
      if (!mounted) return;
      _mostrarErro(e.toString());
    }

    setState(() => _processando = false);
  }

  void _mostrarSucesso(Map<String, dynamic> data) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 8),
            Text('Nota processada!'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Supermercado: ${data['supermercado']}'),
            const SizedBox(height: 4),
            Text('Produtos salvos: ${data['produtos_salvos']}'),
            if ((data['econocoins_creditados'] is num) &&
                (data['econocoins_creditados'] as num) > 0) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.bolt, color: AppColors.secondary, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '+${(data['econocoins_creditados'] as num).toInt()} EconoCoins',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text(
              'Ótimo!',
              style: TextStyle(color: AppColors.primary),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _escaneado = false;
                _processando = false;
              });
            },
            child: const Text('Escanear outra'),
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

              // Chama _processarQrCode com a URL capturada
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
