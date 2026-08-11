# Relatório de execução — EconoWay 0.4.0-alpha.4

Data: 2026-08-10

Checkpoint: **ALPHA_CODE_CANDIDATE — RUNTIME_VALIDATION_PENDING**

## Objetivo desta rodada

Continuar o roadmap a partir da baseline revisada sem alterar o Neon desconhecido e sem ampliar escopo de produto antes de fechar o vertical slice principal.

Fluxo prioritário:

```text
login -> produtos -> carrinho persistente -> mercados/favoritos
-> comparação -> salvar -> histórico
```

Em paralelo: portal B2B/Admin, ingestão NFC-e, importação e hardening.

## Implementado nesta rodada

### Backend/arquitetura

- controllers não acessam PostgreSQL diretamente;
- criada `EconomyService`;
- NFC-e separada em `nfceFetchService`, `nfceParser` e `ReceiptService`;
- erros críticos de NFC-e permanecem mapeados pela camada HTTP;
- parser NFC-e ganhou teste unitário sintético;
- logs de erro dos controllers migraram para logger estruturado;
- `TRUST_PROXY_HOPS` adicionado para deploy atrás de proxy conhecido sem confiar cegamente em `X-Forwarded-For`.

### Catálogo B2B

Foi corrigida uma premissa importante: produto global não vendido por uma unidade **não é** automaticamente produto "sem preço".

A migration `005_market_catalog_membership.sql` cria `supermercado_produto`, separando:

```text
produto global
  -> pertencimento ao catálogo da unidade
      -> oferta/preço
```

Importação, atualização manual, NFC-e e seed garantem o vínculo ao catálogo.

### Inconsistências

Novo endpoint:

`GET /api/supermercados/{id}/inconsistencias`

Regras objetivas:

- `SEM_PRECO`: produto do catálogo da unidade sem oferta;
- `PRECO_DESATUALIZADO`: oferta além de `PRICE_FRESHNESS_HOURS`;
- `FIDELIDADE_MAIOR`: preço de fidelidade superior ao preço normal.

Não há merge/deduplicação automática por similaridade de nome no Alpha por risco de falso positivo/corrupção de catálogo.

### Portal Web

- nova tela de inconsistências;
- contador real no dashboard;
- filtros/paginação;
- seletor de unidade para responsáveis vinculados a múltiplos supermercados;
- contrato de API/Web atualizado.

### Governança

- `CONTRIBUTING.md`;
- `SECURITY.md`;
- checklist de release;
- sanity check agora reprova controller com SQL direto ou `console.*` fora do logger estruturado;
- documentação Obsidian reconciliada com o estado real.

## Contrato

OpenAPI:

- versão: `3.1.2`;
- baseline funcional: `0.4.0-alpha.4`;
- 32 paths;
- 24 schemas.

## Banco

Migrations alvo para **novo ambiente Alpha**:

1. `001_core_schema.sql`;
2. `002_contributions_and_operations.sql`;
3. `003_alpha_integrity.sql`;
4. `004_alpha_query_indexes.sql`;
5. `005_market_catalog_membership.sql`.

### Bloqueio preservado

Essas migrations **não foram executadas no Neon real**. O schema atual ainda precisa ser exportado e reconciliado antes de produzir migration incremental segura.

## Validações executadas neste ambiente

### Verificações independentes de dependências

- `scripts/static_sanity.py`: **OK**;
- `git diff --check`: **OK**;
- TypeScript/TSX transpile syntax: **71 arquivos, 0 erros sintáticos**;
- OpenAPI YAML: **parse OK**, 32 paths / 24 schemas.

### Testes de domínio/segurança executados por transpile manual

Como o runtime não conseguiu instalar o `node_modules`, os testes puros foram transpilados com o TypeScript global e executados via `node --test`:

- CNPJ/documentos: 2;
- carrinho: 3;
- comparação: 2;
- importação: 3;
- policy URL/SSRF NFC-e: 2.

Resultado: **12/12 passaram**.

O novo teste do parser NFC-e não foi executado aqui porque depende de `cheerio`, que não está instalado no runtime atual. Ele será executado pelo `npm test` normal quando as dependências forem instaladas.

## Gates que NÃO foram executados

### Backend/Web

`npm ci` não pôde concluir neste runtime: o registry interno não possuía um pacote transitivo e a tentativa de registry público foi bloqueada/falhou no ambiente. Portanto não foram afirmados como verdes:

```text
npm run typecheck
npm test
npm run build
npm run lint   # Web
```

### Flutter

Flutter/Dart SDK não está instalado neste runtime. Permanecem obrigatórios:

```text
flutter pub get
dart format --set-exit-if-changed .
flutter analyze
flutter test
```

`pubspec.lock` deve ser regenerado pelo SDK; não foi editado manualmente.

### Compose/PostgreSQL

Docker/Podman/`psql` não estão disponíveis aqui. O stack e migrations foram preparados, mas o smoke E2E local ainda precisa ser executado conforme `operations/alpha-runbook.md`.

## Estado por camada

| Camada | Estado |
|---|---|
| Contrato/API | candidato Alpha; runtime pendente |
| Backend | candidato Alpha; build/integration pendentes |
| Android | fluxo funcional implementado; analyze/device pendentes |
| Web B2B/Admin | candidato Alpha; lint/build/browser pendentes |
| PostgreSQL novo | migrations prontas; execução local pendente |
| Neon existente | bloqueado por introspecção/reconciliação |
| Segurança | baseline forte para Alpha; produção ainda exige hardening operacional |
| Documentação | atualizada/canônica para Obsidian |

## Próximo checkpoint

`ALPHA_LOCAL_RUNTIME_VALIDATED`

Critérios:

1. dependências instaladas em ambiente normal;
2. todos os gates de build/test verdes;
3. Compose sobe API/Web/PostgreSQL;
4. smoke completo do runbook;
5. Android Emulator/dispositivo conclui vertical slice sem mocks;
6. erros encontrados corrigidos e documentação atualizada.

Depois disso, o próximo bloqueio material é reconciliar o Neon real.
