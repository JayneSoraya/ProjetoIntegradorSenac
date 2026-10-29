# Checklist de validação

## Gates independentes de dependências

- [ ] `python3 scripts/static_sanity.py`
- [ ] `git diff --check`
- [ ] `docs/api/openapi.yaml` parseia como YAML e contém o contrato das alterações
- [ ] nenhuma migration alvo foi executada no Neon desconhecido

## Backend

- [ ] `npm ci`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm audit --audit-level=high`
- [ ] testes de integração com PostgreSQL quando disponíveis
- [ ] nenhum erro interno/segredo aparece na resposta/log

## Android

- [ ] `flutter pub get`
- [ ] `dart format --output=none --set-exit-if-changed lib test`
- [ ] `flutter analyze`
- [ ] `flutter test`
- [ ] nenhuma URL hardcoded fora de `AppConfig`
- [ ] release sem cleartext
- [ ] sessão em secure storage
- [ ] estados loading/vazio/erro/parcial/stale testados

## Web

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] cookie não é lido/persistido por JavaScript
- [ ] rota oculta também é autorizada no backend
- [ ] importação testa arquivo válido, inválido, duplicado e grande demais
- [ ] layout operável em viewport compacto e desktop

## Smoke integrado

- [ ] Compose sobe `db -> api healthy -> web`
- [ ] `/api/health` 200
- [ ] `/api/ready` 200
- [ ] fluxo B2C completo do runbook
- [ ] fluxo supermercado completo do runbook
- [ ] fluxo admin completo do runbook
- [ ] reiniciar API não perde dados PostgreSQL locais

## Documentação

- [ ] `docs/00-INDEX.md` navegável no Obsidian
- [ ] rastreabilidade atualizada
- [ ] ADR criado/atualizado para decisão estrutural
- [ ] roadmap e changelog atualizados
- [ ] comportamento real não diverge silenciosamente dos protótipos/requisitos
