# Changelog da documentação

## 2026-08-10 — Alpha 0.4.0-alpha.4

- extraída a camada de economia para `EconomyService`, mantendo controllers sem SQL;
- NFC-e separada em fetch/SSRF adapter, parser e `ReceiptService`;
- adicionado teste unitário do parser NFC-e com fixture sintética;
- formalizada fila de inconsistências B2B: sem preço, preço desatualizado e fidelidade maior que preço normal;
- adicionada tela Web de inconsistências e contador real no dashboard;
- adicionado seletor multiunidade no portal do supermercado;
- contrato OpenAPI atualizado para 32 paths e schemas da fila de qualidade;
- documentação de arquitetura Web/Mobile, comparação e EconoCoins reconciliada com a implementação;
- controles de governança/release ampliados.

## 2026-08-10 — Alpha 0.4.0 / terceira consolidação

- definido escopo funcional do Alpha com o documento acadêmico de 2026 como prioridade sobre ideias legadas de 2025;
- roadmap atualizado para refletir carrinho persistente, comparação/histórico, favoritos, portal, importação e EconoCoins já implementados na baseline;
- criados ADRs 007-012;
- documentada política de preço desatualizado e snapshot de comparação;
- documentadas sessão Web/cookie + Android/Bearer e defesa CSRF;
- documentada importação set-based/transacional;
- documentado ambiente Alpha local descartável;
- documentada evolução Firebase -> Node/PostgreSQL como evolução histórica, não reescrita da história;
- documentadas operações técnicas de perfil/exportação/exclusão de dados pessoais;
- criado runbook de smoke local;
- criado mapa dos 13 protótipos para Android/Web;
- OpenAPI atualizado para perfil/privacidade e paginação do catálogo B2B;
- baseline de segurança e rastreabilidade revisadas.

## 2026-08-10 — consolidação inicial

- criada base Obsidian com índice canônico;
- decidido Android como plataforma consumidor do MVP;
- decidido Web como institucional + supermercado + admin;
- definidos atores e RBAC alvo;
- criada estratégia de comparação multi-mercado;
- definida política provisória de EconoCoins;
- criada arquitetura alvo e contrato OpenAPI;
- criado guia de exportação/reconciliação do schema Neon;
- documentado threat model e baseline de segurança;
- revisadas as 13 telas prototipadas;
- criado roadmap por fases e matriz de rastreabilidade.
# 2026-08-11 — Fase 6

- Documentado o script de execução física determinística e o diagnóstico de history/partial.
- Registrada a migração do Cart State para `CartScope` e a extração do card de ações da Home.
