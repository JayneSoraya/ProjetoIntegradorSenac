# EconoWay - Base de conhecimento

> [!important]
> Esta pasta é a fonte canônica de documentação técnica e de produto do EconoWay. Arquivos acadêmicos binários antigos permanecem preservados como evidência histórica; decisões novas entram em Markdown/ADR para uso no Obsidian.

## Estado atual

- baseline: **0.4.0-alpha.4**;
- consumidor: **Android / Flutter**;
- backend: **monólito modular Node.js/Express/TypeScript + PostgreSQL**;
- Web: **institucional + Portal Supermercado + Portal Admin**;
- Alpha local: Compose preparado para PostgreSQL descartável, API e Web;
- Neon real: **BLOQUEADO para migration até exportar/reconciliar o DDL atual**;
- iOS: futuro.

## Começar aqui

1. [[product/alpha-scope|Escopo do Alpha]]
2. [[roadmap/implementation-roadmap|Roadmap]]
3. [[operations/alpha-runbook|Runbook do Alpha]]
4. [[requirements/traceability|Rastreabilidade]]
5. [[roadmap/execution-report-2026-08-10-alpha4|Relatório Alpha 4]]

## Produto

- [[product/vision|Visão]]
- [[product/alpha-scope|Escopo Alpha]]
- [[product/actors-and-permissions|Atores e permissões]]
- [[product/comparison-strategy|Estratégia de comparação]]
- [[product/econocoins|EconoCoins]]

## Arquitetura

- [[architecture/system-context|Contexto do sistema]]
- [[architecture/container-architecture|Containers]]
- [[architecture/mobile-architecture|Android/Flutter]]
- [[architecture/web-architecture|Web]]

## API

- [[api/API-CONTRACT|Contrato e convenções]]
- `api/openapi.yaml` - OpenAPI canônico.

## Banco de dados

- [[database/current-schema|Como obter o schema atual do Neon]]
- [[database/target-schema|Schema alvo Alpha]]
- `../node_backend/database/migrations/` - migrations de ambientes novos/alvo.

## Segurança e privacidade

- [[security/security-baseline|Baseline de segurança]]
- [[security/threat-model|Threat model]]
- [[decisions/ADR-012-user-data-rights-alpha|Operações técnicas de dados pessoais]]

## UX/UI

- [[ux/prototype-review|Revisão dos protótipos]]
- [[ux/alpha-screen-map|Mapa de telas do Alpha]]
- [[ux/design-system|Design system]]
- `ux/reference/prototipos-econoway.pdf` - referência visual recebida.

## Requisitos

- [[requirements/traceability|Matriz requisito -> código -> teste]]

## ADRs

- [[decisions/ADR-001-android-first|ADR-001 Android primeiro]]
- [[decisions/ADR-002-web-portal|ADR-002 Papel do Web]]
- [[decisions/ADR-003-modular-monolith|ADR-003 Monólito modular]]
- [[decisions/ADR-004-api-contract|ADR-004 Contrato de API]]
- [[decisions/ADR-005-econocoins|ADR-005 EconoCoins]]
- [[decisions/ADR-006-price-import|ADR-006 Importação]]
- [[decisions/ADR-007-comparison-snapshots-and-price-freshness|ADR-007 Snapshot/frescor]]
- [[decisions/ADR-008-web-cookie-csrf-mobile-bearer|ADR-008 Sessões Web/Android]]
- [[decisions/ADR-009-price-import-transaction|ADR-009 Import transacional]]
- [[decisions/ADR-010-alpha-local-stack|ADR-010 Stack local Alpha]]
- [[decisions/ADR-011-technology-evolution|ADR-011 Evolução tecnológica]]
- [[decisions/ADR-012-user-data-rights-alpha|ADR-012 Dados pessoais no Alpha]]

## Operação

- [[operations/local-development|Desenvolvimento local]]
- [[operations/alpha-runbook|Runbook Alpha]]
- [[operations/validation-checklist|Checklist de validação]]
- [[operations/release-checklist|Checklist de release]]

## Roadmap e relatórios

- [[roadmap/implementation-roadmap|Roadmap completo]]
- [[roadmap/execution-report-2026-08-10-alpha4|Execução Alpha 4]]
- [[roadmap/execution-report-2026-08-10|Execução inicial]]
- [[roadmap/artifact-change-summary|Resumo inicial de alterações]]
- [[CHANGELOG-DOCS|Changelog]]

## Regra de manutenção

Toda PR que altera comportamento, contrato, banco, segurança, privacidade ou fluxo de UI deve atualizar a documentação relevante e, quando aplicável, `api/openapi.yaml` + `requirements/traceability.md`.
