# Contrato da API

Arquivo canônico: `openapi.yaml` — OpenAPI 3.1.2, versão funcional Alpha `0.4.0-alpha.4`.

## Convenções

- base path `/api`;
- JSON UTF-8;
- nomes externos preservam `snake_case` para compatibilidade do código atual;
- IDs positivos;
- Android: `Authorization: Bearer <JWT>`;
- Web: cookie `econoway_session` HttpOnly;
- mutações Web autenticadas por cookie passam por validação de origem;
- erro funcional pode ser informado, stack/SQL/segredo não;
- totais de comparação são calculados no servidor.

## Áreas do contrato

### Plataforma

- `/health`, `/ready`.

### Autenticação/consumidor

- `/auth/cadastro`, `/auth/login`, `/auth/logout`, `/auth/me`;
- `/auth/recuperar-senha` permanece 501 e não é exposto na UI Alpha;
- `/usuario/me` GET/PUT/DELETE;
- `/usuario/me/exportar`.

### Produto/carrinho/mercados

- `/produtos`, `/produtos/{id}`;
- `/carrinho`;
- `/supermercados`, favoritos e seleção;
- catálogo B2B `/supermercados/{id}/produtos` é paginado;
- `/supermercados/{id}/inconsistencias` expõe fila objetiva de qualidade do catálogo.

### Comparação

- `/comparacao` aceita cesta, IDs de mercados e `salvar`;
- `/comparacao/historico`;
- `/comparacao/{id}`.

### Contribuição e economia

- `/notas/processar`;
- `/economia/resumo`.

### Operação B2B/Admin

- atualização de preço;
- validar/aplicar/histórico de importação;
- `/admin/resumo`, usuários, mercados e auditoria.

## Regra de mudança

Alteração incompatível exige, no mesmo conjunto de mudanças:

1. OpenAPI;
2. backend;
3. consumidores Android/Web afetados;
4. teste relevante;
5. rastreabilidade/changelog;
6. ADR se alterar semântica de produto/segurança.
