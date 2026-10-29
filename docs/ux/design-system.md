# Diretrizes UI/UX

## Android primeiro

Os mockups existentes usam moldura e convenções visuais de iPhone. O produto Android deve manter o conteúdo/branding, mas utilizar padrões Material/Android para navegação, app bars, campos, diálogos e comportamento de voltar.

## Navegação principal proposta

No consumidor:

1. Início
2. Buscar
3. Carrinho
4. Favoritos
5. Perfil

Se cinco destinos se mostrarem excessivos em teste de usabilidade, Favoritos pode migrar para Início/Perfil. Não adicionar um destino só porque existe espaço.

## Ações persistentes

Durante busca/navegação com carrinho não vazio, mostrar barra contextual próxima à parte inferior:

```text
10 itens no carrinho        [Ver carrinho]
Melhor estimativa: R$ ...
```

Essa barra não substitui a navegação inferior; deve respeitar safe areas e não cobrir ações.

## Feedback

- loading não pode parecer travamento;
- erros devem dizer o que o usuário pode fazer;
- ações irreversíveis pedem confirmação quando necessário;
- estados vazios têm um CTA útil;
- dados estimados devem ser rotulados como estimativa e mostrar recência quando relevante.

## Acessibilidade

- alvos de toque adequados;
- contraste verificável;
- não comunicar estado somente por cor;
- labels de acessibilidade para ícones;
- suporte a escala de fonte;
- foco/teclado no portal Web.
