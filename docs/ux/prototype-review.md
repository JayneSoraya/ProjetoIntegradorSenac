# Revisão dos protótipos

Referência: `reference/prototipos-econoway.pdf`.

## Princípio

Os protótipos são referência de intenção e fluxo, não especificação pixel-perfect. O MVP Android deve adaptar os fluxos para padrões Android/Material, preservar linguagem visual EconoWay e alterar telas quando a usabilidade, consistência ou segurança melhorar.

## Página 1 - busca de mercados

**Preservar:** busca, favoritos, distância, avaliação e estado aberto.

**Melhorar:** filtros devem indicar estado ativo de forma clara; distância depende de permissão de localização e precisa de estado alternativo quando a permissão for negada. Favoritos devem ser persistidos por usuário.

## Página 2 - carrinho vazio

**Preservar:** estado vazio + CTA.

**Mudar:** remover o bloco de resumo com três zeros; ele não adiciona informação quando não há itens. Manter uma única ação primária "Adicionar produtos".

## Página 3 - login

**Preservar:** e-mail, senha e cadastro. A recuperação de senha permanece no desenho de produto, mas fica oculta no Alpha até existir token de uso único + provedor de e-mail funcional.

**Mudar:** Google/Facebook só aparecem quando OAuth estiver realmente implementado. Não apresentar controles sem backend funcional. Visual deve ser adaptado a Android, não copiar componentes iOS.

## Página 4 - home

**Preservar:** busca, economia estimada, favoritos, ações rápidas e mercados próximos.

**Mudar:** evitar hamburger + bottom navigation para as mesmas áreas. Usar navegação inferior apenas para destinos primários e top app bar para ações contextuais. Carrinho permanece acessível e com badge.

## Página 5 - carrinho

O protótipo mistura conteúdo do carrinho com resultados de mercados. A arquitetura de informação deve separar:

1. **Carrinho:** produtos + quantidades + subtotal de referência;
2. **Comparação:** mercados + cobertura + total + economia.

Isso reduz ambiguidade sobre o que está sendo editado.

## Página 6 - comparação concluída

**Preservar:** destaque da melhor opção e comparação fidelidade/sem fidelidade.

**Expandir:** apresentar vários mercados e transparência de cobertura. O usuário decidiu que a comparação é multi-mercado e pode ser limitada a favoritos/próximos/selecionados.

## Páginas 7 e 8 - importação

A ideia é válida, mas pertence ao **portal Web do supermercado**, não ao app Android do consumidor.

Mudanças:

- MVP: CSV e JSON;
- baixar modelo;
- upload -> validação -> preview -> confirmação -> processamento;
- erros por linha;
- histórico e checksum para idempotência;
- TXT removido até existir requisito real.

## Página 9 - administração

Mover para Web e adaptar a desktop/tablet. Cards de indicadores permanecem, mas os números devem vir da API; nunca usar valores mockados em ambiente real.

## Páginas 10 e 11 - responsável do supermercado

Mover para Web. O conceito de visão por ator está correto e passa a ser decisão arquitetural oficial.

## Página 12 - busca de produtos

É a melhor referência do conjunto para o fluxo principal.

**Preservar:** lista simples, categorias, preço, ação "Adicionar" e barra persistente do carrinho com quantidade/estimativa e CTA "Ver carrinho". Essa barra resolve o caso de usuário continuar navegando com itens no carrinho sem perder o contexto.

## Página 13 - comparação parcial

**Preservar:** aviso explícito e detalhamento de produto sem preço.

**Melhorar:** nunca comparar totais parciais como se fossem equivalentes. O ranking deve priorizar cestas completas e usar cobertura para resultados parciais.
