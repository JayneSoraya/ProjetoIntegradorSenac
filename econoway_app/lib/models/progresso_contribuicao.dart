/// Resposta de GET /api/progresso.
class ProgressoContribuicao {
  final double progresso;
  final int notasImportadas;
  final int metaNotas;
  final int notasRestantes;
  final int produtosComPreco;
  final int metaProdutos;
  final int totalMercados;
  final bool concluido;
  final String mensagem;

  const ProgressoContribuicao({
    required this.progresso,
    required this.notasImportadas,
    required this.metaNotas,
    required this.notasRestantes,
    required this.produtosComPreco,
    required this.metaProdutos,
    required this.totalMercados,
    required this.concluido,
    required this.mensagem,
  });

  factory ProgressoContribuicao.fromJson(Map<String, dynamic> json) {
    int asInt(dynamic value, [int padrao = 0]) =>
        int.tryParse(value?.toString() ?? '') ?? padrao;

    final bruto = double.tryParse(json['progresso']?.toString() ?? '') ?? 0;
    return ProgressoContribuicao(
      progresso: bruto.clamp(0.0, 1.0),
      notasImportadas: asInt(json['notas_importadas']),
      metaNotas: asInt(json['meta_notas'], 10),
      notasRestantes: asInt(json['notas_restantes']),
      produtosComPreco: asInt(json['produtos_com_preco']),
      metaProdutos: asInt(json['meta_produtos'], 50),
      totalMercados: asInt(json['total_mercados']),
      concluido: json['concluido'] == true,
      mensagem: json['mensagem_progresso']?.toString() ?? '',
    );
  }
}
