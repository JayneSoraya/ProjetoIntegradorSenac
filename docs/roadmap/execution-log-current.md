## Fase 0

Status: PARTIAL — pacote entregue sem repositório Git local.
Mudanças: Nenhuma destrutiva; baseline documental e de ferramentas levantada.
Validações: Node 24.14.1, npm 11.12.1, Docker 29.2.1, docker-compose 5.1.0, Git 2.53.0; Flutter/Dart/psql/pg_dump ausentes.
Bloqueios: Sem .git; sem Flutter/Dart; sem cliente PostgreSQL; Compose não baixou postgres:17-alpine (HTTP 500 do registry).
Próximo: Manter status ALPHA_CODE_CANDIDATE até gates Android e runtime local serem executáveis.

## Fase 1

Status: PASS — backend e Web validados.
Mudanças: Script de teste do backend passou a executar `dist/**/*.test.js`; efeitos React ajustados para cumprir React 19 hooks lint.
Validações: Backend typecheck/build/test 15/15; Web lint/build; static_sanity OK.
Bloqueios: npm audit reporta vulnerabilidades transitivas; revisar upgrade com changelog antes de alterar dependências.
Próximo: Reexecutar Flutter, banco local e smoke E2E em ambiente com ferramentas/registry disponíveis.

# Execução corrente — Fase Android/UX — 2026-08-10

## Escopo

- GitHub, CI remoto e push permanecem explicitamente fora do escopo.
- Validação local Android, favoritos, geolocalização em primeiro plano, comparação parcial e hardening.

## Evidências desta fase

- AVD oficial `econoway_api35` criado com imagem `android-35;google_apis;x86_64`.
- APK debug compilado com sucesso após instalar `geolocator` e permissão de localização.
- Manifesto debug permite HTTP apenas para o host local do emulador (`10.0.2.2:3333`); manifesto principal continua HTTPS-only.
- `flutter analyze`: 0 issues.
- `integration_test/app_test.dart` criado com cinco cenários de fluxo Android.
- O harness oficial `flutter test integration_test/... -d emulator-5554` instala o APK, mas encerra o VM Service antes de carregar os testes (`VmServiceDisappearedException`); logcat não mostrou crash fatal nem erro de cleartext.

## Funcionalidades fechadas

- Favoritos por usuário continuam usando PUT/DELETE autenticados e filtro dedicado.
- Localização: permissão foreground, fallback seguro para perfil/sem coordenadas e envio de `lat/lng` ao endpoint existente.
- Comparação parcial permanece explícita e não permite salvar resultado incompleto.

## Pendências

- Revalidar `integration_test` em ambiente com runner Flutter estável.
- Migrar gradualmente `CarrinhoController` singleton e decompor `HomeScreen` em widgets menores.

## Fase 4 — diagnóstico e hardening

Status: PARTIAL.

Evidência: o app mínimo em `C:\DOCS\SENAC\_flutter_integration_repro` reproduziu uma vez o `VmServiceDisappearedException`, mas passou duas execuções após limpar apenas daemons/estado transitório. O smoke EconoWay isolado também passou. Isso não permite atribuir o problema ao código EconoWay; há intermitência na fronteira Flutter/ADB/emulador.

Correção UX: `HomeScreen` teve os cards principais ajustados para telas Android estreitas (`childAspectRatio`, texto com limite/truncamento e `mainAxisSize`), após TESTE 2 expor `RenderFlex overflow` e tap fora da área.

Teste individual: `auth_flow_test.dart` passou. O cenário TESTE 2 chegou à execução e falhou por overflow/tap antes da correção; uma tentativa posterior ficou sem conclusão devido a travamento do ADB/Gradle, sem evidência nova de VM Service.

Estado estrutural: `CarrinhoController` ainda é singleton global; a migração foi deliberadamente adiada até o harness E2E ficar estável, conforme regra desta fase. `HomeScreen` recebeu apenas hardening visual incremental, ainda não foi totalmente decomposta.

## Fase 5 — dispositivo físico

Status: PARTIAL — nenhum dispositivo físico autorizado foi detectado; somente `emulator-5554` está conectado.

Evidência: `adb devices -l` e `flutter devices` listaram apenas o AVD. Não foi executado `adb reverse` nem `flutter run` em aparelho real. A configuração `API_BASE_URL` já aceita `--dart-define`; a documentação do fluxo USB foi criada em `docs/operations/android-physical-device-development.md`.

Hardening: manifesto principal/release permanece cleartext=false. O manifesto debug passou a usar Network Security Config com cleartext limitado a `localhost`, `127.0.0.1` e `10.0.2.2`; APK debug compilado e `flutter analyze` PASS.

Próximo: conectar/autorizar aparelho físico, executar reverse USB e preencher matriz E2E por dispositivo sem registrar serial pessoal.

## Resultado do dispositivo físico — 2026-08-11

Status: PARTIAL.

Evidência: aparelho Android físico autorizado; `adb reverse tcp:3333 tcp:3333` ativo; Compose/API locais saudáveis. APK debug instalado com `API_BASE_URL=http://127.0.0.1:3333/api`.

Matriz física: smoke PASS, auth PASS, cart PASS, comparison PASS. History e partial ficaram FLAKY com teardown incompleto do integration runner após instalação; não houve assertion executada nesses dois casos.

Correções de teste: comparação recebeu `pumpAndSettle`/`ensureVisible`; histórico ganhou fluxo independente, mas segue pendente até o runner completar o teardown de forma estável.

## Fase 6 — E2E determinístico e estado

Status: PARTIAL.

Mudanças: criado `scripts/test-android-physical.ps1` com descoberta de dispositivo físico, cleanup opcional do APK, `adb reverse`, health/ready e cenário explícito. `CarrinhoController` deixou de ser singleton global; `CartScope` injeta uma instância por árvore do app. Adicionados testes de estado para vazio, add, repetição, incremento, remoção, clear e subtotal. Extraído `HomeQuickActionCard` da Home.

Validações: `flutter analyze` PASS, `flutter test` PASS (7 testes), APK debug PASS.

Bloqueios: o dispositivo físico não estava disponível na tentativa de reexecução pelo script; history/partial ainda não tiveram assertion funcional completada de forma determinística nesta rodada.

Próximo: reconectar o aparelho, rodar `scripts/test-android-physical.ps1 history` e `partial` individualmente com cleanup, depois revalidar cart/comparison após a injeção do estado.
