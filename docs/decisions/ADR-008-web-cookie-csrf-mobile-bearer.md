# ADR-008 - Sessão Web por cookie e Android por Bearer

Status: Aceita

## Contexto

O Android e o portal Web têm superfícies de ataque e mecanismos de sessão diferentes.

## Decisão

- Android: JWT em `Authorization: Bearer`, persistido apenas em secure storage.
- Web: sessão em cookie `econoway_session`, `HttpOnly`, `Secure` em produção e `SameSite=Strict`.
- Requisições mutáveis autenticadas por cookie passam por validação de `Origin` contra a allowlist CORS.
- Nenhum JWT é persistido em `localStorage`/`sessionStorage`.
- O backend restringe algoritmo, issuer e audience do JWT e não possui segredo default.

## Trade-offs

A validação de origem é adequada ao Alpha controlado e funciona em conjunto com `SameSite=Strict`. Para topologias Web mais complexas, múltiplos domínios ou integrações de terceiros, migrar para uma defesa CSRF dedicada (token sincronizado/double-submit/custom header) e rever a política de cookies.

## Referências de engenharia

- Express Production Security Best Practices.
- OWASP Cross-Site Request Forgery Prevention Cheat Sheet.
