class MercadoComparacaoDTO {
  final int idSupermercado;
  final String nome;
  final double total;
  final double totalFidelidade;
  final int totalItens;
  final int itensEncontrados;
  final int itensFaltando;
  final int itensDesatualizados;
  final bool carrinhoCompleto;
  final List<dynamic> encontrados;
  final List<dynamic> faltando;

  const MercadoComparacaoDTO({
    required this.idSupermercado,
    required this.nome,
    required this.total,
    required this.totalFidelidade,
    required this.totalItens,
    required this.itensEncontrados,
    required this.itensFaltando,
    required this.itensDesatualizados,
    required this.carrinhoCompleto,
    required this.encontrados,
    required this.faltando,
  });

  factory MercadoComparacaoDTO.fromJson(
    Map<String, dynamic> json,
  ) => MercadoComparacaoDTO(
    idSupermercado:
        int.tryParse(json['id_supermercado']?.toString() ?? '') ?? 0,
    nome: json['nome_fantasia']?.toString() ?? '',
    total: double.tryParse(json['total']?.toString() ?? '') ?? 0,
    totalFidelidade:
        double.tryParse(json['total_fidelidade']?.toString() ?? '') ?? 0,
    totalItens: int.tryParse(json['total_itens']?.toString() ?? '') ?? 0,
    itensEncontrados:
        int.tryParse(json['itens_encontrados']?.toString() ?? '') ?? 0,
    itensFaltando: int.tryParse(json['itens_faltando']?.toString() ?? '') ?? 0,
    itensDesatualizados:
        int.tryParse(json['itens_desatualizados']?.toString() ?? '') ?? 0,
    carrinhoCompleto: json['carrinho_completo'] == true,
    encontrados: json['encontrados'] is List
        ? json['encontrados'] as List
        : const [],
    faltando: json['faltando'] is List ? json['faltando'] as List : const [],
  );
}

class ComparacaoResumoDTO {
  final int? melhorMercadoId;
  final String? melhorMercado;
  final double melhorTotal;
  final double mediaTresMaisCaros;
  final double economiaPotencial;
  final int mercadosAvaliados;
  final int mercadosCompletos;
  final bool salvo;
  final int? idComparacao;
  final int itensDesatualizadosTotal;

  const ComparacaoResumoDTO({
    required this.melhorMercadoId,
    required this.melhorMercado,
    required this.melhorTotal,
    required this.mediaTresMaisCaros,
    required this.economiaPotencial,
    required this.mercadosAvaliados,
    required this.mercadosCompletos,
    required this.salvo,
    required this.idComparacao,
    required this.itensDesatualizadosTotal,
  });

  factory ComparacaoResumoDTO.fromJson(
    Map<String, dynamic> json,
  ) => ComparacaoResumoDTO(
    melhorMercadoId: int.tryParse(json['melhor_mercado_id']?.toString() ?? ''),
    melhorMercado: json['melhor_mercado']?.toString(),
    melhorTotal: double.tryParse(json['melhor_total']?.toString() ?? '') ?? 0,
    mediaTresMaisCaros:
        double.tryParse(json['media_tres_mais_caros']?.toString() ?? '') ?? 0,
    economiaPotencial:
        double.tryParse(json['economia_potencial']?.toString() ?? '') ?? 0,
    mercadosAvaliados:
        int.tryParse(json['mercados_avaliados']?.toString() ?? '') ?? 0,
    mercadosCompletos:
        int.tryParse(json['mercados_completos']?.toString() ?? '') ?? 0,
    salvo: json['salvo'] == true,
    idComparacao: int.tryParse(json['id_comparacao']?.toString() ?? ''),
    itensDesatualizadosTotal:
        int.tryParse(json['itens_desatualizados_total']?.toString() ?? '') ?? 0,
  );
}

class ComparacaoResultadoDTO {
  final List<MercadoComparacaoDTO> mercados;
  final ComparacaoResumoDTO resumo;

  const ComparacaoResultadoDTO({required this.mercados, required this.resumo});

  factory ComparacaoResultadoDTO.fromJson(Map<String, dynamic> json) {
    final markets = json['mercados'];
    final summary = json['resumo'];
    if (markets is! List || summary is! Map<String, dynamic>) {
      throw const FormatException('Resposta de comparação inválida.');
    }
    return ComparacaoResultadoDTO(
      mercados: markets
          .whereType<Map<String, dynamic>>()
          .map(MercadoComparacaoDTO.fromJson)
          .toList(),
      resumo: ComparacaoResumoDTO.fromJson(summary),
    );
  }
}
