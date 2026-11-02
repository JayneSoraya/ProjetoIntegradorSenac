import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:http/http.dart' as http;
import '../theme/app_theme.dart';
import '../core/config/app_config.dart';
import '../services/auth_service.dart';

class SefazWebviewScreen extends StatefulWidget {
  final int idNota;
  final String urlSefaz;

  const SefazWebviewScreen({
    super.key,
    required this.idNota,
    required this.urlSefaz,
  });

  @override
  State<SefazWebviewScreen> createState() => _SefazWebviewScreenState();
}

class _SefazWebviewScreenState extends State<SefazWebviewScreen> {
  InAppWebViewController? _webViewController;
  bool _carregando = true;
  bool _enviandoHtml = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Resolva o Captcha e Consulte'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          // Botão manual para disparar a extração correta incluindo o iframe da SEFAZ
          IconButton(
            icon: const Icon(Icons.cloud_upload_rounded),
            tooltip: 'Importar Nota Agora',
            onPressed: _enviandoHtml ? null : _capturarEEnviarHtml,
          ),
        ],
      ),
      body: Stack(
        children: [
          InAppWebView(
            initialUrlRequest: URLRequest(url: WebUri(widget.urlSefaz)),
            onWebViewCreated: (controller) {
              _webViewController = controller;
            },
            onLoadStart: (controller, url) {
              setState(() => _carregando = true);
            },
            onLoadStop: (controller, url) {
              setState(() => _carregando = false);
            },
          ),
          if (_carregando || _enviandoHtml)
            Container(
              color: Colors.black.withValues(alpha: 0.3),
              child: const Center(
                child: CircularProgressIndicator(color: Colors.white),
              ),
            ),
        ],
      ),
    );
  }

  // Captura o HTML interno 
  Future<void> _capturarEEnviarHtml() async {
    if (_webViewController == null) return;

    setState(() => _enviandoHtml = true);

    try {
      
      final htmlContent = await _webViewController!.evaluateJavascript(
        source: """
          (function() {
            var iframe = document.querySelector('iframe');
            if (iframe) {
              try {
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc && iframeDoc.documentElement) {
                  return iframeDoc.documentElement.innerHTML;
                }
              } catch (e) {
                // Caso haja restrição de cross-origin, tenta o fallback
              }
            }
            return document.documentElement.innerHTML;
          })();
        """,
      );

      if (htmlContent != null && htmlContent is String) {
        await _enviarHtmlParaBackend(htmlContent);
      } else {
        setState(() => _enviandoHtml = false);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erro ao ler o conteúdo da página da SEFAZ.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      setState(() => _enviandoHtml = false);
      debugPrint('Erro ao avaliar JS no WebView: $e');
    }
  }

  // Envia o HTML completo para o backend processar os itens
  Future<void> _enviarHtmlParaBackend(String htmlContent) async {
    
    try {
      final token = await AuthService.getToken();
      final url = AppConfig.endpoint('/notas/${widget.idNota}/importar-html');
      
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'html': htmlContent}),
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Nota sincronizada e produtos importados com sucesso!',
            ),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      } else {
        setState(() => _enviandoHtml = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'A página exibida ainda não contém os produtos. Certifique-se de clicar em Consultar primeiro.',
            ),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      setState(() => _enviandoHtml = false);
      debugPrint('Erro ao enviar HTML para o backend: $e');
    }
  }
}
