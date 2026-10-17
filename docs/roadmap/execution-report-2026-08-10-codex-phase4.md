# ECONOWAY — Fase 4 — VM Service, Android E2E e UX

# STATUS

`PARTIAL_ANDROID_VALIDATION`. O diagnóstico foi aprofundado, o smoke mínimo e o smoke EconoWay passaram em execuções posteriores, mas o conjunto funcional ainda não tem todos os cenários verdes.

# VM SERVICE DIAGNOSIS

O `VmServiceDisappearedException` foi reproduzido uma vez em um app Flutter mínimo criado fora do workspace, usando o mesmo Flutter 3.44.9 e o mesmo AVD. O logcat mostrou VM Service ouvindo e nenhum crash fatal. Após `gradlew --stop` e `flutter clean`, duas execuções do mínimo passaram; o smoke EconoWay também passou. Portanto, a evidência aponta para intermitência na fronteira runner/ADB/emulador, não para um bug confirmado no EconoWay. Não foram adicionadas flags experimentais nem alterado o channel.

# GATES

- Flutter stable 3.44.9 / Dart 3.12.2: capturado.
- Android SDK 36, API 35 Google APIs x86_64, emulator 37.1.11: capturado.
- `flutter analyze`: PASS após a correção da Home.
- `flutter test`: PASS — 4/4.
- APK debug: anteriormente PASS; deve ser recompilado no fechamento final.
- Backend/Web: sem mudanças nesta fase; gates anteriores permanecem válidos.

# ANDROID E2E

- Smoke EconoWay: PASS isolado.
- App mínimo externo: 1 falha inicial, 2 execuções posteriores PASS.
- `auth_flow_test.dart`: PASS.
- TESTE 2: alcançou o fluxo e revelou overflow/tap fora da área na Home; tentativa posterior ficou sem conclusão por instabilidade ADB/Gradle.
- Suite completa: ainda não aprovada.

# CART REFACTOR

Não iniciado. `CarrinhoController` continua singleton global. A migração foi adiada conscientemente até o harness E2E estabilizar, conforme a regra da fase.

# HOME REFACTOR

Hardening incremental aplicado: cards principais agora usam proporção responsiva, texto limitado/truncado e `mainAxisSize` mínimo. A decomposição completa em widgets coesos permanece pendente.

# TESTS

- `flutter analyze`: PASS.
- `flutter test`: PASS (4/4).
- Smoke EconoWay: PASS.
- `auth_flow_test.dart`: PASS.
- TESTE 2: bloqueado por overflow/tap na primeira execução; correção aplicada, reexecução limitada por ADB/Gradle.

# SECURITY

Nenhuma flag de engine, downgrade, troca de channel ou permissão nova foi adicionada. GitHub/CI remoto continuam fora do escopo.

# UX

Corrigido overflow visível dos cards da Home em tela Android estreita. O problema era concreto e independente do VM Service.

# DATABASE

Nenhuma migration ou alteração de banco foi feita.

# WORKSPACE/GIT

`LOCAL_WORKSPACE_NOT_VERSIONED`: o workspace continua sem `.git`. Nenhum `git init`, commit, push ou ação GitHub foi executado.

# BLOCKERS

- Instabilidade intermitente de ADB/runner ainda impede declarar todos os E2E verdes.
- Carrinho singleton e decomposição completa da Home ainda pendentes por ordem de segurança da fase.

# NEXT CHECKPOINT

Reexecutar TESTE 2 após reiniciar somente ADB/Gradle, depois TESTE 3, 4 e 5 individualmente. Só com os cinco verdes iniciar a migração injetável do carrinho.
