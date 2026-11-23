import 'api_client.dart';

/// Converte qualquer falha de rede/servidor em texto compreensível para a pessoa usuária.
String mensagemDeErro(Object erro, {String? padrao}) {
  if (erro is ApiException) return erro.message;
  return padrao ??
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
}
