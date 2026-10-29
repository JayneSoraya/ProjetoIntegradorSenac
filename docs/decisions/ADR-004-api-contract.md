# ADR-004 - OpenAPI como contrato canônico

- Status: Aceito
- Data: 2026-08-10

## Decisão

Manter `docs/api/openapi.yaml` como contrato explícito entre backend, Android e Web.

A versão usada inicialmente é OpenAPI 3.1.2. A especificação 3.2.0 já existe, mas não há benefício funcional no projeto que justifique exigir a revisão minor mais nova durante a fase de estabilização.

## Consequência

Mudanças de endpoint/campo devem ocorrer de forma coordenada e testável.
