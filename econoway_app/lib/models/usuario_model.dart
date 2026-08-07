class UsuarioModel {
  final String nome;
  final String email;
  final String senha;
  final String cep;
  final bool aceiteLgpd;

  UsuarioModel({
    required this.nome,
    required this.email,
    required this.senha,
    required this.cep,
    this.aceiteLgpd = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'nome': nome,
      'email': email,
      'senha': senha,
      'cep': cep,
      'aceite_lgpd': aceiteLgpd,
    };
  }

  factory UsuarioModel.fromJson(Map<String, dynamic> json) {
    return UsuarioModel(
      nome: json['nome'],
      email: json['email'],
      senha: '',
      cep: json['cep'].toString(),
    );
  }
}
