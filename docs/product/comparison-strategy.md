# Estratégia de comparação de preços

## Decisão funcional

A comparação considera **vários supermercados**. O usuário pode limitar candidatos a:

- favoritos;
- próximos;
- selecionados manualmente;
- todos os mercados aprovados do escopo disponível.

## Regra base - mesma cesta

Uma comparação válida preserva produtos e quantidades. O servidor normaliza itens repetidos e valida IDs/quantidades. Um mercado com itens faltantes nunca é apresentado como equivalente a uma cesta completa.

Cada resultado informa:

- total de itens;
- itens encontrados/faltantes;
- cobertura;
- cesta completa/parcial;
- total normal e de fidelidade;
- recência/desatualização dos preços.

## Ranking

1. cestas completas;
2. menor total entre completas;
3. parciais por maior cobertura;
4. menor total apenas como desempate entre coberturas equivalentes.

## Frescor

`PRICE_FRESHNESS_HOURS` define a janela operacional. Preço antigo não desaparece silenciosamente: permanece no resultado com indicador `desatualizado`, para que o usuário entenda a qualidade da estimativa.

## Fidelidade

Quando existir `preco_fidelidade`, o resultado apresenta total normal e fidelidade separadamente. Não se presume que o consumidor tenha o programa.

## Persistência

Salvar comparação é explícito. O backend **recalcula** a cesta no momento do save e persiste um snapshot, em vez de confiar no total enviado pelo cliente. Histórico e dashboard usam comparações efetivamente salvas.

## Futuro - compra dividida

A próxima estratégia possível é otimizar compra em 2+ mercados. Ela só deve entrar quando existirem geolocalização e modelo de custo confiáveis, pois a função objetivo precisa considerar:

```text
economia de produtos
- custo de deslocamento
- custo/tempo adicional
```

Somar simplesmente o menor preço de cada item seria um resultado enganoso.
