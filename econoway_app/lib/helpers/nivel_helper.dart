import 'package:flutter/material.dart';

/// Nível de contribuição da pessoa usuária, derivado do total de notas importadas.
class NivelEconoWayer {
  final String nome;
  final String descricao;
  final Color cor;
  final IconData icone;
  final int minNotas;
  final int? maxNotas;

  const NivelEconoWayer({
    required this.nome,
    required this.descricao,
    required this.cor,
    required this.icone,
    required this.minNotas,
    this.maxNotas,
  });

  static const int notasPrata = 6;
  static const int notasOuro = 21;

  static NivelEconoWayer obterNivel(int totalNotas) {
    if (totalNotas >= notasOuro) {
      return const NivelEconoWayer(
        nome: 'EconoWayer Ouro',
        descricao: 'Referência na comunidade: suas notas mantêm o mapa vivo.',
        cor: Color(0xFFB8860B),
        icone: Icons.workspace_premium_rounded,
        minNotas: notasOuro,
      );
    }
    if (totalNotas >= notasPrata) {
      return const NivelEconoWayer(
        nome: 'EconoWayer Prata',
        descricao: 'Caçador de ofertas: seus preços ajudam outras pessoas.',
        cor: Color(0xFF708090),
        icone: Icons.verified_rounded,
        minNotas: notasPrata,
        maxNotas: notasOuro - 1,
      );
    }
    return const NivelEconoWayer(
      nome: 'EconoWayer Bronze',
      descricao: 'Explorador local: cada nota importada melhora o mapa.',
      cor: Color(0xFFCD7F32),
      icone: Icons.shield_rounded,
      minNotas: 0,
      maxNotas: notasPrata - 1,
    );
  }

  /// Notas que faltam para o próximo nível (0 no nível máximo).
  static int notasParaProximoNivel(int totalNotas) {
    if (totalNotas < notasPrata) return notasPrata - totalNotas;
    if (totalNotas < notasOuro) return notasOuro - totalNotas;
    return 0;
  }

  /// Progresso (0 a 1) dentro do nível atual.
  static double progressoDoNivel(int totalNotas) {
    if (totalNotas >= notasOuro) return 1.0;
    if (totalNotas >= notasPrata) {
      return ((totalNotas - notasPrata) / (notasOuro - notasPrata)).clamp(
        0.0,
        1.0,
      );
    }
    return (totalNotas / notasPrata).clamp(0.0, 1.0);
  }
}
