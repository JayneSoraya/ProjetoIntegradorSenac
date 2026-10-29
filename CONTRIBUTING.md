# Contribuindo com o EconoWay

## Fluxo de trabalho

1. atualize a `main` local;
2. crie branch curta `feature/<issue>-descricao`, `fix/<issue>-descricao` ou `docs/<issue>-descricao`;
3. implemente uma mudança coesa;
4. execute os gates locais aplicáveis;
5. atualize documentação/OpenAPI quando houver alteração de comportamento;
6. abra PR vinculada à Issue;
7. não faça merge com CI vermelha ou conflito pendente.

Branches permanentes por pessoa não fazem parte do fluxo alvo.

## Commits

Use mensagens que expliquem intenção. Formato recomendado, não obrigatório:

```text
feat(cart): persist user cart
fix(auth): reject missing JWT secret
docs(api): document price import
```

Evite `add`, `update`, `correção` ou mensagens sem contexto.

## Definition of Done

Uma mudança funcional só está pronta quando:

- comportamento esperado está implementado;
- erros e autorização foram considerados;
- teste relevante existe quando tecnicamente viável;
- contrato OpenAPI foi atualizado quando necessário;
- documentação/rastreabilidade foi atualizada;
- não há segredo, token ou `.env` commitado;
- lint/typecheck/test/build aplicáveis estão verdes.

## Banco de dados

Não altere banco compartilhado manualmente como forma permanente de deploy. Mudanças estruturais devem ser migrations versionadas.

> O Neon existente ainda precisa ter seu schema exportado e reconciliado. Não execute as migrations Alpha novas contra esse banco sem o procedimento documentado em `docs/database/current-schema.md`.
