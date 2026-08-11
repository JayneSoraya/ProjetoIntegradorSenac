# Checklist de release / promoção

Este checklist evita chamar uma baseline de Beta/produção apenas porque as telas parecem prontas.

## Código e contrato

- [ ] `scripts/static_sanity.py` verde.
- [ ] `git diff --check` verde.
- [ ] OpenAPI parseia e representa endpoints alterados.
- [ ] backend `npm ci && npm run typecheck && npm test && npm run build` verde.
- [ ] Web `npm ci && npm run lint && npm run build` verde.
- [ ] Flutter `flutter pub get && dart format --set-exit-if-changed . && flutter analyze && flutter test` verde.
- [ ] nenhum segredo/configuração local versionado.

## Banco

- [ ] schema alvo reconciliado com o schema real do ambiente.
- [ ] migration testada em cópia/homologação.
- [ ] backup/snapshot válido antes da mudança.
- [ ] rollback ou estratégia de forward-fix documentada.
- [ ] migrations executadas por processo controlado, não manualmente em produção sem registro.

## Segurança

- [ ] HTTPS obrigatório.
- [ ] segredo JWT forte e gerenciado externamente.
- [ ] CORS restrito aos origins reais.
- [ ] cookie `Secure`, `HttpOnly`, `SameSite=Strict` no Web.
- [ ] rate limit compartilhado/gateway se houver mais de uma instância.
- [ ] CodeQL/dependency audit sem achado crítico/alto não aceito.
- [ ] contas administrativas com MFA antes de produção real.

## Funcional Alpha Android

- [ ] login/logout.
- [ ] busca de produtos.
- [ ] adicionar/alterar/remover carrinho.
- [ ] restaurar carrinho persistido.
- [ ] selecionar/favoritar mercados.
- [ ] comparação completa e parcial.
- [ ] indicador de preço desatualizado.
- [ ] salvar comparação e visualizar histórico.
- [ ] scanner NFC-e válido/duplicado/inválido.
- [ ] perfil/exportação/exclusão.

## Portal B2B/Admin

- [ ] login por papel.
- [ ] multiunidade.
- [ ] preço manual + auditoria.
- [ ] CSV/JSON validar -> preview -> importar -> histórico.
- [ ] inconsistências.
- [ ] admin usuários/supermercados/auditoria.

## Operação

- [ ] `/health` e `/ready` monitorados.
- [ ] logs estruturados centralizados.
- [ ] restore do banco testado.
- [ ] observabilidade sem registrar credenciais/tokens.
- [ ] smoke test pós-deploy.
