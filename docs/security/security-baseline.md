# Baseline de segurança

Atualizado em 2026-08-10 — Alpha 0.4.0.

## Controles implementados

### Identidade e autenticação

- `JWT_SECRET` obrigatório, mínimo de 32 caracteres e sem fallback conhecido;
- JWT HS256 com `issuer`, `audience`, `subject` e expiração;
- mensagens genéricas para credenciais inválidas;
- bcrypt para senha;
- política de cadastro de 8 caracteres a 72 bytes UTF-8;
- Web usa cookie HttpOnly, Secure em produção e SameSite Strict;
- Android usa Bearer e secure storage;
- nenhum JWT é persistido no `localStorage` Web;
- conta desativada não autentica;
- RBAC `USUARIO`, `SUPERMERCADO`, `ADMIN`.

### Autorização B2B/Admin

- criação/moderação de supermercado é ADMIN;
- responsável só altera unidade vinculada em `supermercado_responsavel` e vínculo ATIVO;
- atualização de preço/importação passam por autorização no backend;
- admin não bloqueia a própria conta;
- mutações críticas geram auditoria.

### Rate limiting Alpha

Em memória, single-instance:

- login: falhas por par IP+e-mail e IP diário;
- cadastro: limite por IP;
- NFC-e: limite por conta;
- validar/aplicar importação: limite por conta;
- exportação/exclusão de dados pessoais: limite por conta.

Limitação: antes de escalar horizontalmente, mover o estado para gateway/Redis/serviço compartilhado.

### CSRF/CORS

- CORS usa allowlist configurável e `credentials=true`;
- operações mutáveis autenticadas por cookie exigem `Origin` pertencente à allowlist;
- Bearer Android não depende de `Origin`;
- SameSite Strict é defesa adicional, não a única premissa.

### Headers HTTP

- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Referrer-Policy: no-referrer`;
- `Permissions-Policy` restritiva na API;
- `Cross-Origin-Resource-Policy`;
- CSP restritiva na API;
- HSTS em produção;
- `x-powered-by` desabilitado;
- `Cache-Control: no-store` no Alpha.

### Transporte/mobile

- Android main/release bloqueia cleartext;
- exceção HTTP é apenas debug local;
- build Flutter de produção rejeita `API_BASE_URL` não HTTPS.

### NFC-e / SSRF

- HTTPS obrigatório;
- allowlist de hosts;
- porta customizada/credenciais de URL bloqueadas;
- resolução DNS checada contra IPs privados, loopback, link-local e especiais;
- redirects manuais, limitados e revalidados;
- content-type/tamanho/timeouts controlados;
- nota deduplicada por identidade/hash;
- escrita de nota/ofertas é transacional.

### Banco

- consultas analisadas usam parâmetros do `node-postgres`;
- operações multi-step usam client transacional e `release()` em `finally`;
- migrations controladas por checksum/advisory lock;
- banco real desconhecido não recebe migration alvo cegamente.

### Logging/erros

- request ID;
- access logs estruturados JSON;
- nenhum token/senha é registrado nos caminhos revisados;
- stack/erro PostgreSQL não é devolvido ao cliente;
- `scripts/static_sanity.py` bloqueia regressões simples conhecidas.

### Privacidade técnica

- consumidor pode consultar/alterar dados opcionais de perfil;
- exportação JSON de dados vinculados;
- exclusão exige nova confirmação de senha;
- estas funções ajudam operacionalmente, mas não equivalem a conformidade LGPD completa.

## Riscos residuais relevantes

1. JWT Bearer Android não possui revogação server-side no Alpha; token roubado permanece útil até expirar.
2. rate limit é local ao processo.
3. parser NFC-e depende da estrutura HTML atual da SEFAZ-SP e precisa de fixtures de regressão.
4. não há MFA no admin.
5. não há infraestrutura real de TLS/deploy/segredos/monitoramento nesta cópia.
6. política jurídica de retenção/anonimização de notas e hábitos de compra ainda precisa ser definida.
7. `Cache-Control: no-store` global é conservador e pode ser refinado em endpoints públicos depois de análise de performance.

## Referências de engenharia adotadas

- Express Production Security Best Practices: TLS, validação de entrada, cookies seguros, redução de fingerprint e proteção contra brute force.
- OWASP SSRF Prevention Cheat Sheet: allowlist quando destinos legítimos são conhecidos e validação de IP/domínio/redirect.
- OWASP CSRF Prevention Cheat Sheet: SameSite como defesa em profundidade e verificação de origem/custom headers conforme topologia.
- node-postgres: queries parametrizadas e disciplina de pool/client release.

## Proxy reverso e endereço do cliente

`TRUST_PROXY_HOPS` é `0` por padrão. Em deploy atrás de proxy/gateway, configure somente o número conhecido de hops confiáveis. Isso é necessário para `req.ip`, rate limiting e auditoria usarem o cliente correto sem confiar cegamente em `X-Forwarded-For`.
