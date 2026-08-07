import 'package:flutter/material.dart';

class NivelEconoWayer {
  final String nome;
  final String subtituloSocial;
  final Color cor;
  final IconData icone;
  final int minScans;
  final int? maxScans;

  NivelEconoWayer({
    required this.nome,
    required this.subtituloSocial,
    required this.cor,
    required this.icone,
    required this.minScans,
    this.maxScans,
  });

  /// Calcula o nível atual com base no total de notas escaneadas
  static NivelEconoWayer obterNivel(int totalScans) {
    if (totalScans >= 21) {
      return NivelEconoWayer(
        nome: 'EconoWayer Ouro',
        subtituloSocial:
            '👑 Você é uma lenda! Ajuda toda Araraquara a economizar.',
        cor: const Color(0xFFFFD700), // Dourado
        icone: Icons.workspace_premium_rounded,
        minScans: 21,
        maxScans: null,
      );
    } else if (totalScans >= 6) {
      return NivelEconoWayer(
        nome: 'EconoWayer Prata',
        subtituloSocial:
            '🥈 Caçador de Ofertas! Araraquara economiza com você.',
        cor: const Color(0xFFC0C0C0), // Prateado
        icone: Icons.verified_rounded,
        minScans: 6,
        maxScans: 20,
      );
    } else {
      return NivelEconoWayer(
        nome: 'EconoWayer Bronze',
        subtituloSocial:
            '🥉 Explorador Local! Começando a transformar suas compras.',
        cor: const Color(0xFFCD7F32), // Bronze
        icone: Icons.shield_rounded,
        minScans: 1,
        maxScans: 5,
      );
    }
  }

  static int scansParaProximoNivel(int totalScans) {
    if (totalScans < 6) return 6 - totalScans;
    if (totalScans < 21) return 21 - totalScans;
    return 0; // Nível máximo atingido
  }

  static double progressoDoNivel(int totalScans) {
    if (totalScans >= 21) return 1.0;
    if (totalScans >= 6) {
      return ((totalScans - 6) / (20 - 6)).clamp(0.0, 1.0);
    }
    return (totalScans / 5).clamp(0.0, 1.0);
  }
}
