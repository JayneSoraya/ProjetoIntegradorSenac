class PerfilUsuario {
  final int idConta;
  final int idUsuario;
  final String nome;
  final String email;
  final String? cep;
  final String? endereco;
  final String? tipoVeiculo;

  const PerfilUsuario({
    required this.idConta,
    required this.idUsuario,
    required this.nome,
    required this.email,
    this.cep,
    this.endereco,
    this.tipoVeiculo,
  });

  factory PerfilUsuario.fromJson(Map<String, dynamic> json) {
    return PerfilUsuario(
      idConta: (json['id_conta'] as num).toInt(),
      idUsuario: (json['id_usuario'] as num).toInt(),
      nome: json['nome']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      cep: json['cep']?.toString(),
      endereco: json['endereco']?.toString(),
      tipoVeiculo: json['tipo_veiculo']?.toString(),
    );
  }
}
