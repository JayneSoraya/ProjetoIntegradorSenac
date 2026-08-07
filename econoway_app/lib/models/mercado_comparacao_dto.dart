class MercadoComparacaoDTO {
  final int idSupermercado;

  final String nome;

  final double total;

  final int totalItens;

  final int itensEncontrados;

  final int itensFaltando;

  final bool carrinhoCompleto;

  final List<dynamic> encontrados;

  final List<dynamic> faltando;

  MercadoComparacaoDTO({
    required this.idSupermercado,
    required this.nome,
    required this.total,
    required this.totalItens,
    required this.itensEncontrados,
    required this.itensFaltando,
    required this.carrinhoCompleto,
    required this.encontrados,
    required this.faltando,
  });

  factory MercadoComparacaoDTO.fromJson(Map<String, dynamic> json) {
    return MercadoComparacaoDTO(
      idSupermercado: json['id_supermercado'] ?? 0,

      nome: json['nome_fantasia'] ?? '',

      total: double.tryParse(json['total'].toString()) ?? 0,

      totalItens: json['total_itens'] ?? 0,

      itensEncontrados: json['itens_encontrados'] ?? 0,

      itensFaltando: json['itens_faltando'] ?? 0,

      carrinhoCompleto: json['carrinho_completo'] ?? false,

      encontrados: json['encontrados'] ?? [],

      faltando: json['faltando'] ?? [],
    );
  }
}
