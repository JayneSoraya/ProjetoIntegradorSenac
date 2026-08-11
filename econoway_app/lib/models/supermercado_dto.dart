class SupermercadoDTO {
  final int id;
  final String nome;
  final String cnpj;
  final String endereco;
  final double avaliacao;
  final bool aberto;
  final bool favorito;
  final double? distanciaKm;

  const SupermercadoDTO({
    required this.id,
    required this.nome,
    required this.cnpj,
    required this.endereco,
    required this.avaliacao,
    required this.aberto,
    required this.favorito,
    this.distanciaKm,
  });

  factory SupermercadoDTO.fromJson(Map<String, dynamic> json) =>
      SupermercadoDTO(
        id: NumberParser.toInt(json['id_supermercado']),
        nome: json['nome_fantasia']?.toString() ?? '',
        cnpj: json['cnpj']?.toString() ?? '',
        endereco: json['endereco_completo']?.toString() ?? '',
        avaliacao: NumberParser.toDouble(json['reputacao_media']),
        aberto: json['esta_aberto'] == true,
        favorito: json['favorito'] == true,
        distanciaKm: json['distancia_km'] == null
            ? null
            : NumberParser.toDouble(json['distancia_km']),
      );
}

class NumberParser {
  static int toInt(dynamic value) => int.tryParse(value?.toString() ?? '') ?? 0;
  static double toDouble(dynamic value) =>
      double.tryParse(value?.toString() ?? '') ?? 0;
}
