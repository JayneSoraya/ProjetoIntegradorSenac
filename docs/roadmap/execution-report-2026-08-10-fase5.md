# ECONOWAY — Fase 5 — Dispositivo físico, E2E e UX

# STATUS

`PARTIAL_ANDROID_VALIDATION`. O dispositivo físico foi conectado e validado parcialmente via USB/reverse. O conjunto E2E ainda não está totalmente verde.

# PHYSICAL DEVICE

Celular Android físico autorizado e reconhecido pelo Flutter como Android 16/API 36. O serial não foi registrado na documentação.

`adb reverse tcp:3333 tcp:3333` ativo. API local respondeu `/health=ok` e `/ready=ready`.

# E2E MATRIX

| Fluxo | Emulator | Physical |
|---|---|---|
| smoke | PASS isolado | PASS |
| auth | PASS | PASS |
| cart | PASS após correção da Home | PASS |
| comparison | NOT_RUN nesta rodada | PASS |
| history | NOT_RUN nesta rodada | FLAKY |
| partial | NOT_RUN nesta rodada | FLAKY |

# VM SERVICE

O app mínimo externo falhou uma vez com `VmServiceDisappearedException` e passou em duas execuções após limpeza transitória. No físico, smoke/auth/cart/comparison passaram. History/partial terminaram com teardown incompleto do runner, sem assertion executada. A classificação permanece intermitência runner/ADB/emulador.

# CART

`CarrinhoController` ainda é singleton global. A migração foi adiada até os E2E principais ficarem verdes.

# HOME

Corrigido o overflow dos cards 2×2 em telas Android estreitas com layout responsivo, texto limitado e melhor área de toque. A decomposição estrutural completa permanece pendente.

# TESTS

- `flutter analyze`: PASS.
- `flutter test`: PASS — 4/4.
- `flutter build apk --debug`: PASS com `API_BASE_URL=http://127.0.0.1:3333/api`.
- Smoke físico: PASS.
- Auth físico: PASS.
- Cart físico: PASS.
- Comparison físico: PASS.
- History/partial físicos: FLAKY, teardown incompleto sem assertion.

# SECURITY

- Manifesto principal/release continua `usesCleartextTraffic=false`.
- Debug usa Network Security Config restrita a `localhost`, `127.0.0.1` e `10.0.2.2`.
- API não foi exposta na LAN; comunicação física usa `adb reverse`.
- Sem localização background, secrets, tokens ou serial pessoal documentado.

# UX

O overflow encontrado no TESTE 2 foi corrigido e validado no celular físico. A validação de teclado, SafeArea e fontes em uso prolongado permanece complementar.

# DATABASE

Nenhuma migration ou alteração de banco remoto/local.

# GIT STATUS

`GIT_VERSIONING_DEFERRED_BY_ENVIRONMENT`. Workspace sem `.git`; não foram executados `git init`, clone, configuração Git, commit, push ou PR.

# BLOCKERS

- History e partial E2E ainda instáveis no runner físico.
- Carrinho singleton e decomposição completa da Home ainda pendentes.

# NEXT CHECKPOINT

Reexecutar history/partial em arquivos isolados após estabilizar o teardown do runner. Só depois iniciar a migração injetável do carrinho.

Documentação do fluxo físico: `docs/operations/android-physical-device-development.md`.
