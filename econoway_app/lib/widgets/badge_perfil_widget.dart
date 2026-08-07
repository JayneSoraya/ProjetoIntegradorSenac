import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../helpers/nivel_helper.dart';

class BadgePerfilWidget extends StatelessWidget {
  final String nomeUsuario;
  final int totalScans;

  const BadgePerfilWidget({
    super.key,
    required this.nomeUsuario,
    required this.totalScans,
  });

  @override
  Widget build(BuildContext context) {
    final nivel = NivelEconoWayer.obterNivel(totalScans);
    final faltam = NivelEconoWayer.scansParaProximoNivel(totalScans);
    final progresso = NivelEconoWayer.progressoDoNivel(totalScans);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primary.withOpacity(0.85)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          // ── Avatar com Badge de Nível ───────────────────────
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              CircleAvatar(
                radius: 40,
                backgroundColor: Colors.white24,
                child: Text(
                  nomeUsuario.isNotEmpty ? nomeUsuario[0].toUpperCase() : 'U',
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              // Ícone do Badge do Nível
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: nivel.cor,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
                child: Icon(nivel.icone, size: 18, color: Colors.black87),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ── Nome do Usuário ──────────────────────────────────
          Text(
            nomeUsuario,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),

          const SizedBox(height: 6),

          // ── Titulo de Identidade Social (Badge Pill) ──────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: nivel.cor.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: nivel.cor, width: 1.5),
            ),
            child: Text(
              nivel.nome.toUpperCase(),
              style: TextStyle(
                color: nivel.cor,
                fontWeight: FontWeight.bold,
                fontSize: 12,
                letterSpacing: 1.1,
              ),
            ),
          ),

          const SizedBox(height: 12),

          // ── Frase de Pertencimento Social ────────────────────
          Text(
            nivel.subtituloSocial,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 13,
              height: 1.3,
            ),
          ),

          const SizedBox(height: 18),
          const Divider(color: Colors.white24, height: 1),
          const SizedBox(height: 14),

          // ── Barra de Progresso do Nível ──────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                faltam > 0
                    ? 'Faltam $faltam ${faltam == 1 ? 'nota' : 'notas'} p/ o próximo nível'
                    : 'Nível Máximo Atingido!',
                style: const TextStyle(
                  color: Color(0xE6FFFFFF),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                '${totalScans} notas',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: progresso,
              minHeight: 8,
              backgroundColor: Colors.white24,
              valueColor: AlwaysStoppedAnimation<Color>(nivel.cor),
            ),
          ),
        ],
      ),
    );
  }
}
