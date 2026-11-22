# Relatório de execução — Alpha runtime validation

## 1. Baseline inicial

- Diretório: `C:\DOCS\SENAC\ProjetoIntegradorSenac-EconoWay`.
- Documentação canônica iniciada por `docs/00-INDEX.md`; baseline declarada: 0.4.0-alpha.4.
- [BLOQUEIO] o pacote entregue não contém `.git`; não foi possível obter branch, HEAD, remoto, histórico ou status de working tree.

## 2. Ferramentas

- Node v24.14.1; npm 11.12.1; Docker 29.2.1; docker-compose v5.1.0; Git 2.53.0.
- Flutter, Dart, psql e pg_dump não encontrados no PATH.

## 3. Mudanças realizadas

- `node_backend/package.json`: `npm test` compila e executa testes JavaScript em `dist/**/*.test.js`, corrigindo o runner que tentava importar TypeScript de `src`.
- Web: efeitos de carregamento em portal/admin e inconsistências/preços foram ajustados para satisfazer a regra React 19 `set-state-in-effect`; efeito redundante de edição de preço foi removido.
- Registros de execução adicionados em `docs/roadmap/execution-log-current.md`.

## 4. Bugs descobertos

- Script de testes do backend falhava com sete `ERR_MODULE_NOT_FOUND` ao executar fontes TypeScript diretamente; corrigido e validado.
- Lint Web falhava em seis efeitos React e um warning de dependência; corrigido.

## 5. Segurança

- `scripts/static_sanity.py`: PASS (157 arquivos).
- Revisão dirigida confirmou segredo JWT obrigatório e mínimo de 32 caracteres, CORS com allowlist, headers baseline, CSRF para browser, limite de JSON, SSRF NFC-e e logs sem credenciais.
- `npm audit --omit=dev`: 2 vulnerabilidades transitivas (body-parser/qs); ficam como risco conhecido para revisão de dependências.

## 6. Banco e migrações

- `docker-compose --env-file .env.compose.example config`: PASS; credenciais são locais e o compose aponta para PostgreSQL local.
- `docker-compose up --build -d`: BLOQUEADO antes do start porque o registry retornou HTTP 500 ao resolver `postgres:17-alpine`.
- Nenhuma migration remota ou Neon foi executada; `pg_dump` ausente.

## 7. Testes e builds

- Backend: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`: PASS; 15 testes aprovados.
- Web: `npm ci`, `npm run lint`, `npm run build`: PASS.
- Flutter: não executado por ausência de Flutter/Dart.
- API `/health`, `/ready`, seed e smoke E2E: não executados por bloqueio da stack PostgreSQL.

## 8. Estado final

**ALPHA_CODE_CANDIDATE**. O código backend/Web está validado estaticamente, mas a validação Alpha local completa não pode ser declarada sem Android, banco local e fluxo E2E.

## 9. Próximo checkpoint

Disponibilizar Flutter/Dart, `psql`/`pg_dump` e acesso funcional ao registry Docker; então executar os gates Android, subir Compose, aplicar migrations 001–005, seed, `/health`, `/ready` e smoke do vertical slice.
