# Roadmap de implementação

Atualizado em 2026-08-10 — baseline **0.4.0-alpha.4**.

Legenda: **OK**, **PARCIAL**, **BLOQUEADO**, **FUTURO**.

## Objetivo imediato

Fechar um Alpha técnico demonstrável do fluxo acadêmico principal antes de ampliar escopo:

```text
login -> produto -> carrinho -> mercados -> comparação -> salvar -> histórico
```

Em paralelo, disponibilizar o mínimo operacional do supermercado/admin no Web.

## Fase 0 - saneamento, segurança e governança

Status: **OK no artefato / PARCIAL no GitHub remoto**.

Concluído:

- conflitos Git removidos;
- README e documentação canônica reorganizados;
- segredo JWT obrigatório, sem fallback;
- JWT com algoritmo/issuer/audience verificados;
- autenticação duplicada removida;
- RBAC `USUARIO`, `SUPERMERCADO`, `ADMIN`;
- CORS allowlist;
- cookie Web HttpOnly/SameSite Strict/Secure em produção;
- defesa de origem para operações Web mutáveis;
- rate limiting Alpha para login, cadastro, NFC-e, importação e operações de privacidade;
- headers HTTP de segurança e remoção de `x-powered-by`;
- logs estruturados de request + request ID;
- Android release sem cleartext;
- JWT mobile em secure storage;
- URL da API centralizada;
- SSRF hardening de NFC-e;
- script `scripts/static_sanity.py` e CI;
- CodeQL JS/TS.

Pendente externo:

- branch protection/ruleset no GitHub;
- executar CI completa em runner com dependências/Flutter disponíveis;
- trocar rate limiting em memória por store/gateway compartilhado antes de escalar horizontalmente.

## Fase 1 - contrato e banco reprodutível

Status: **PARCIAL por dependência do Neon atual**.

Concluído:

- OpenAPI 3.1.2 canônico;
- migrations 001-005 para ambiente Alpha novo;
- migrations com checksum, tabela de controle, advisory lock e transação;
- índices de integridade, busca e consultas do Alpha;
- seed demonstrativo idempotente;
- Compose local PostgreSQL + API + Web com health checks.

Bloqueado:

- exportar `schema-current.sql` do Neon real;
- reconciliar diferenças;
- gerar migration incremental específica do banco existente;
- definir/validar rollback antes de qualquer execução real.

## Fase 2 - autenticação, sessão e atores

Status: **PARCIAL avançado**.

Concluído:

- cadastro/login consumidor;
- `/auth/me`;
- Bearer Android + cookie Web;
- vínculo conta-supermercado;
- autorização B2B por vínculo;
- admin separado;
- bloqueio/ativação de contas;
- perfil, exportação e exclusão técnica dos dados do consumidor.

Pendente:

- recuperação de senha com provedor de e-mail e token de uso único;
- revogação/rotação de sessão/token para cenários de produção;
- fluxo administrativo formal de convite/provisionamento de responsáveis;
- MFA para administrador antes de produção real.

## Fase 3 - produtos, supermercados e favoritos

Status: **PARCIAL avançado**.

Concluído:

- produto Controller -> Service -> Repository;
- busca server-side por nome/marca/código;
- catálogo consumidor apenas com ofertas de mercados aprovados;
- favoritos por usuário;
- lista de supermercados com filtro/ordenação no Android;
- distância Haversine quando localização do usuário é conhecida;
- fallback para coordenadas salvas no perfil;
- catálogo B2B paginado;
- atualização manual de preço/fidelidade com auditoria;
- índices trigram alvo para busca de produto.

Pendente:

- localização Android real com permissão e UX apropriada;
- horários estruturados em vez do booleano simplificado `esta_aberto`;
- detalhes/avaliações de supermercado quando o requisito retornar ao escopo;
- paginação/cursor na busca B2C se volume justificar.

## Fase 4 - carrinho, comparação e histórico

Status: **OK para Alpha técnico**.

Concluído:

- carrinho persistente por usuário no backend;
- apenas um carrinho `ABERTO` por usuário no schema alvo;
- sincronização idempotente e set-based;
- validação de IDs/quantidades;
- comparação set-based entre múltiplos mercados aprovados;
- seleção de mercados/favoritos;
- completo antes de parcial;
- preço ausente explícito;
- preço desatualizado explícito;
- preço de fidelidade;
- salvamento explícito com recálculo server-side;
- snapshot/histórico;
- tela Android de histórico.

Futuro:

- otimização de compra dividida entre 2+ mercados considerando deslocamento, somente depois de geolocalização e modelo de custo confiáveis.

## Fase 5 - NFC-e e contribuição de dados

Status: **PARCIAL avançado**.

Concluído:

- scanner Android;
- backend autenticado e rate-limited;
- allowlist HTTPS SEFAZ-SP;
- validação DNS/IP/redirects/size/content-type;
- persistência de nota e itens;
- hash/chave única para deduplicação;
- atualização transacional de ofertas;
- EconoCoin creditado apenas para contribuição inédita válida.

Pendente:

- fixtures HTML reais anonimizadas e testes regressivos do parser;
- estratégia para mudanças de HTML da SEFAZ;
- adaptadores por UF somente conforme necessidade real;
- política de retenção e minimização dos dados da nota antes de produção.

## Fase 6 - EconoCoins

Status: **OK para regra Alpha / FUTURO para programa econômico**.

Regra Alpha:

- cadastro/login/comparação: 0;
- NFC-e válida e inédita: +100;
- saldo derivado do ledger `econocoin_evento`;
- não possui equivalência monetária.

Futuro: antifraude avançado, catálogo de recompensas ou qualquer conversão financeira exigem ADR próprio e revisão jurídica/contábil.

## Fase 7 - portal supermercado e administração

Status: **PARCIAL avançado**.

Concluído:

- portal separado por papel;
- dashboard do supermercado;
- seletor multiunidade para contas com vários vínculos;
- unidades vinculadas;
- catálogo paginado;
- atualização de preço;
- importação/histórico;
- fila de inconsistências objetiva (sem preço, stale, fidelidade suspeita);
- admin dashboard;
- busca/bloqueio de contas;
- moderação de supermercados;
- auditoria.

Pendente:

- paginação no admin para escala maior;
- fluxo de criação/vínculo de operador via UI;
- deduplicação semântica de catálogo permanece futura para evitar merge falso;
- métricas operacionais e notificações.

## Fase 8 - importação de preços

Status: **OK para Alpha técnico**.

Concluído:

- CSV e JSON;
- limite de arquivo/registro;
- parse no portal + validação obrigatória no servidor;
- preview e erros por linha;
- checksum/idempotência;
- publicação PostgreSQL set-based e transacional;
- falha registrada sem publicar lote parcial;
- histórico/auditoria.

Futuro: processamento assíncrono/filas somente se volume real tornar necessário.

## Fase 9 - testes e CI/CD

Status: **PARCIAL**.

Concluído:

- testes de domínio backend para carrinho, comparação, importação, CNPJ e policy NFC-e;
- teste unitário do parser NFC-e com fixture sintética;
- testes Flutter para carrinho e DTO;
- CI backend/web/Flutter;
- audit de dependências em CI;
- CodeQL;
- sanity checks independentes de dependências.

Pendente:

- integração API + PostgreSQL real no CI;
- contract tests OpenAPI;
- testes Web;
- fixtures NFC-e;
- widget/integration tests Flutter dos fluxos principais;
- teste E2E do Compose.

## Fase 10 - observabilidade, privacidade e hardening

Status: **PARCIAL**.

Concluído:

- health/readiness;
- request ID;
- access log estruturado;
- shutdown gracioso/pool close;
- endpoint de perfil/exportação/exclusão do consumidor;
- auditoria de mutações críticas B2B/Admin.

Pendente antes de produção:

- coleta centralizada de logs e métricas;
- alertas/SLOs;
- política real de retenção/minimização;
- processo de resposta a incidente;
- gestão/rotação de segredos;
- HTTPS/deploy real;
- backup/restore testado;
- testes de carga e plano de capacidade;
- revisão jurídica LGPD/termos.

## Próximo checkpoint

`ALPHA_LOCAL_READY_FOR_RUNTIME_VALIDATION`

Para atingir o checkpoint:

1. regenerar dependências/lock Flutter;
2. `npm ci`, typecheck/test/build backend;
3. lint/build Web;
4. `flutter analyze/test`;
5. subir Compose;
6. executar `operations/alpha-runbook.md`;
7. corrigir regressões encontradas;
8. somente depois reconciliar Neon real.

## Fase 6 — estado atual

Status: **PARCIAL**.

- Cart State migrado de singleton para `CartScope` com `ChangeNotifier` injetado.
- Testes Flutter de carrinho ampliados e verdes.
- Primeiro bloco coeso da Home extraído para `HomeQuickActionCard`.
- E2E físico de history/partial ainda depende de runner/ADB determinístico e dispositivo conectado.
