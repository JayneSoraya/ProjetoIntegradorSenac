/// Formatação de valores no padrão brasileiro, sem depender de pacotes extras.
String formatarMoeda(num valor) {
  final negativo = valor < 0;
  final fixo = valor.abs().toStringAsFixed(2);
  final partes = fixo.split('.');
  final inteiro = partes[0];
  final buffer = StringBuffer();
  for (var i = 0; i < inteiro.length; i++) {
    final restantes = inteiro.length - i;
    buffer.write(inteiro[i]);
    if (restantes > 1 && restantes % 3 == 1) buffer.write('.');
  }
  return '${negativo ? '-' : ''}R\$ ${buffer.toString()},${partes[1]}';
}

String _doisDigitos(int valor) => valor.toString().padLeft(2, '0');

/// Formata uma data ISO (ou [DateTime]) como dd/MM/yyyy, no fuso do aparelho.
/// Retorna [vazio] quando a data é ausente ou inválida.
String formatarData(Object? valor, {bool comHora = false, String vazio = '—'}) {
  final DateTime? data = valor is DateTime
      ? valor
      : DateTime.tryParse(valor?.toString() ?? '');
  if (data == null) return vazio;
  final local = data.toLocal();
  final dia =
      '${_doisDigitos(local.day)}/${_doisDigitos(local.month)}/${local.year}';
  if (!comHora) return dia;
  return '$dia ${_doisDigitos(local.hour)}:${_doisDigitos(local.minute)}';
}

/// Quantidade sem casas decimais quando inteira (ex.: 2) ou com até 3 casas.
String formatarQuantidade(num valor) {
  if (valor == valor.roundToDouble()) return valor.toInt().toString();
  return valor
      .toStringAsFixed(3)
      .replaceAll(RegExp(r'0+$'), '')
      .replaceAll('.', ',');
}
