# ECONOWAY — Fase 6 — E2E determinístico, Cart State e Home

# STATUS

`PARTIAL_ANDROID_VALIDATION`. O refactor estrutural do carrinho e a primeira extração coesa da Home foram concluídos com gates Flutter verdes. A validação física final aguarda o aparelho reaparecer no ADB.

# HISTORY/PARTIAL DIAGNOSIS

History e partial anteriores terminaram com teardown incompleto do runner, sem assertion. Nesta fase foi criado fluxo independente de histórico e um script de cleanup/reverse por cenário. A reexecução física não pôde ser concluída porque o dispositivo deixou de aparecer no ADB. Não foram declarados PASS sem assertion.

# E2E MATRIX

| Fluxo | Resultado conhecido |
|---|---|
| smoke físico | PASS |
| auth físico | PASS |
| cart físico antes do refactor | PASS |
| comparison físico antes do refactor | PASS |
| history | HARNESS_FAIL / sem assertion nesta rodada |
| partial | HARNESS_FAIL / sem assertion nesta rodada |

# CART REFACTOR

Removido o singleton global mutável. `EconoWayApp` cria uma instância `CarrinhoController` e fornece o estado por `CartScope` (`InheritedNotifier`). Produtos, Home, carrinho e comparação usam a mesma instância injetada. A lista externa continua imutável e foi adicionado `subtotalEstimado`.

# HOME REFACTOR

Extraído `HomeQuickActionCard` para `lib/widgets/home_quick_action_card.dart`. A Home permanece em decomposição incremental; não houve rewrite amplo.

# TESTS

- `dart format`: PASS.
- `flutter analyze`: PASS.
- `flutter test`: PASS — 7 testes.
- `flutter build apk --debug`: PASS.
- Script físico criado: `scripts/test-android-physical.ps1`.
- Execução física pós-refactor: pendente por ausência atual do dispositivo ADB.

# SECURITY

- Nenhum comando Git executado.
- Sem secrets, tokens ou serial pessoal em scripts/documentos.
- API física continua via `adb reverse`; release HTTPS-only preservado.

# UX

O card de ação da Home foi extraído sem alterar a intenção visual. O overflow anterior permanece corrigido.

# DATABASE

Nenhuma migration ou alteração de banco.

# GIT

`GIT_VERSIONING_DEFERRED_BY_ENVIRONMENT`. Workspace sem `.git`; commits/push/PR continuam fora do escopo.

# BLOCKERS

- ADB sem dispositivo físico disponível no fechamento desta rodada.
- History/partial ainda sem assertion PASS determinística nesta fase.
- Home ainda não totalmente decomposta.

# NEXT CHECKPOINT

Reconectar o celular e executar, individualmente:

```powershell
.\scripts\test-android-physical.ps1 history
.\scripts\test-android-physical.ps1 partial
.\scripts\test-android-physical.ps1 cart
.\scripts\test-android-physical.ps1 comparison
```

Depois atualizar a matriz e decidir o checkpoint Alpha sem confundir `FUNCTIONAL_FLOW_VALIDATED` com runner verde.
