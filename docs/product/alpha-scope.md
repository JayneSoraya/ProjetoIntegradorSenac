# Escopo funcional do Alpha

Atualizado em 2026-08-10.

## Fonte de verdade para esta fase

A entrega acadêmica mais recente disponível em `docs/1#U00aa entrega 3#U00ba semestre EconoWay 2026 revis#U00e3o 6 abnt.docx` define o fluxo principal que o Alpha deve provar:

1. usuário autenticado;
2. busca de produto por nome, categoria ou código de barras;
3. seleção de produtos e quantidades;
4. comparação da mesma cesta em vários supermercados;
5. identificação da alternativa de menor total;
6. cálculo explícito da economia;
7. possibilidade de salvar a comparação no histórico.

Também define dois casos alternativos obrigatórios:

- carrinho vazio não pode ser comparado;
- preços ausentes devem tornar o resultado parcial/excluir mercados incompletos do ranking principal, nunca aparentar uma falsa economia.

## Vertical slice do Alpha

O Alpha é considerado demonstrável quando o seguinte caminho funcionar de ponta a ponta em ambiente local reproduzível:

```text
Cadastro/Login
  -> buscar produtos
  -> montar carrinho
  -> escolher/favoritar mercados
  -> comparar mesma cesta
  -> visualizar completo/parcial e preço desatualizado
  -> salvar comparação
  -> consultar histórico
  -> processar NFC-e válida e inédita
  -> consultar resumo/EconoCoins
```

No Web:

```text
Responsável do supermercado
  -> login
  -> visualizar unidade vinculada
  -> consultar catálogo paginado
  -> atualizar preço
  -> validar CSV/JSON
  -> confirmar importação
  -> consultar histórico

Administrador
  -> login
  -> indicadores
  -> moderar contas/supermercados
  -> consultar auditoria
```

## Fora do Alpha

Os documentos de 2025 possuem ideias mais amplas que permanecem históricas/deferidas, não requisitos automaticamente ativos do Alpha:

- marketplace/monetização de dados anonimizados;
- repasse financeiro/cashback ao usuário;
- convite de amigos e programa social;
- notificações complexas;
- avaliações completas de supermercados;
- autenticação social;
- otimização de rota com múltiplas paradas;
- divisão automática da cesta entre múltiplos mercados;
- iOS;
- integrações nacionais com todos os portais NFC-e;
- recuperação de senha por e-mail.

Cada item pode retornar ao roadmap por decisão registrada em ADR, depois que o fluxo principal estiver estável.

## Regra contra scope creep

Nenhuma funcionalidade nova deve entrar no Alpha se não responder a uma destas perguntas:

1. fecha o fluxo acadêmico principal?
2. elimina risco de segurança/dados?
3. torna o ambiente reproduzível/testável?
4. é necessária para separar corretamente Usuário, Responsável do Supermercado e Administrador?

Caso contrário, fica em backlog.
