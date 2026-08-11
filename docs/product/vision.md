# Visão do produto EconoWay

## Problema

O consumidor precisa montar uma lista de compras e entender **onde aquela mesma cesta custa menos**, considerando supermercados relevantes para ele, principalmente favoritos, próximos e mercados selecionados manualmente.

## Proposta de valor

O EconoWay consolida preços de múltiplas fontes, compara a cesta de forma transparente e informa:

1. mercados que conseguem atender a cesta completa;
2. total estimado por mercado;
3. itens sem preço ou indisponíveis;
4. economia potencial;
5. efeito de preço de fidelidade quando houver;
6. posteriormente, opções de divisão da compra entre múltiplos mercados quando a economia compensar o deslocamento.

## MVP

### Consumidor - Android

- cadastro e login;
- busca de produtos;
- carrinho persistente;
- seleção de supermercados favoritos/próximos;
- comparação da mesma cesta entre vários supermercados;
- comparação parcial com transparência de cobertura;
- leitura de NFC-e para contribuição de preços;
- histórico de comparações;
- favoritos.

### Responsável do supermercado - Web

- login no portal;
- visualizar supermercado(s) sob sua responsabilidade;
- atualizar preço unitário;
- importar preços em lote;
- visualizar inconsistências;
- histórico de importações.

### Administrador - Web

- visão operacional;
- gestão de usuários e supermercados;
- aprovação/suspensão de supermercados;
- auditoria e inconsistências;
- acompanhamento de importações.

## Fora do MVP

- iOS;
- pagamentos dentro do app;
- EconoCoins convertíveis em dinheiro;
- otimização de rota multiestabelecimento;
- marketplace de dados;
- recomendação por IA.

Esses itens podem existir como visão futura, mas não devem contaminar o escopo técnico inicial.
