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

Formato obrigatório:

```text
tipo: descrição curta em português
```

| Tipo | Uso |
|---|---|
| `feat` | nova funcionalidade |
| `fix` | correção de problema |
| `refactor` | reorganização de código sem mudar comportamento |
| `test` | criação ou ajuste de testes |
| `docs` | documentação |
| `style` | ajuste visual ou formatação |
| `ci` | integração contínua |
| `chore` | manutenção (dependências, limpeza, merges) |

Exemplos:

```text
feat: adicionar validação do carrinho
fix: corrigir erro na comparação de preços
test: testar cálculo de economia
docs: atualizar instruções de instalação
ci: corrigir execução dos testes
```

Regras:

- escreva em português, com linguagem simples, descrevendo exatamente o que mudou;
- um commit por assunto: não misture funcionalidade, formatação e documentação no mesmo commit;
- não crie commits vazios nem mensagens genéricas como `update`, `ajustes` ou `correção`;
- use seu nome e o e-mail vinculado à sua conta do GitHub (`git config user.name` e `git config user.email`), para que o commit apareça no seu perfil;
- não altere autoria nem datas de commits já publicados e não reescreva histórico compartilhado (`push --force`, rebase de commits publicados);
- publique somente alterações testadas.

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
