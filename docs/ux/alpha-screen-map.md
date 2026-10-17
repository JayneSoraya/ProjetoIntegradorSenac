# Mapa de telas do Alpha

Referência visual: `docs/ux/reference/prototipos-econoway.pdf`.

Os protótipos definem intenção e fluxo, não pixel-perfect obrigatório. Mudanças devem melhorar clareza, acessibilidade, responsividade e honestidade do estado do sistema.

| Protótipo | Intenção | Destino Alpha | Estado |
|---|---|---|---|
| p.1 Mercados | busca, distância, avaliação, aberto, favorito | Android `SupermercadosScreen` | implementado em baseline; distância depende de localização conhecida |
| p.2 Carrinho vazio | impedir comparação vazia | Android | implementado |
| p.3 Login | autenticação consumidor | Android | implementado; recuperação de senha oculta enquanto backend não existe |
| p.4 Home | economia, favoritos, ações, próximos | Android Home | parcial; sem inventar dados de proximidade |
| p.5 Carrinho | comparar cesta em mercados | Android | implementado com seleção explícita |
| p.6 Resultado | menor preço/fidelidade/salvar | Android | implementado com completo/parcial e frescor |
| p.7-8 Importação | upload + padrão | Web supermercado | implementado Alpha para CSV/JSON; TXT adiado |
| p.9 Admin | gestão geral | Web Admin | implementado Alpha |
| p.10-11 Supermercado | catálogo/importação/preço | Web supermercado | implementado Alpha |
| p.12 Produtos | pesquisa + CTA persistente carrinho | Android | implementado com busca server-side debounced |
| p.13 Parcial | transparência de preço faltante | Android | implementado conceitualmente |

## Princípios UX adotados

- não mostrar ação que sabidamente não funciona;
- preço faltante não vira `R$ 0`;
- preço antigo recebe sinalização, em vez de desaparecer silenciosamente;
- ações de trabalho denso (tabelas, importação, auditoria) ficam no Web;
- consumidor permanece mobile-first;
- a barra persistente de carrinho da p.12 é um padrão prioritário para manter contexto;
- em telas Web maiores, catálogo/admin podem evoluir para list-detail/supporting-pane; em telas compactas, preservar navegação de uma tarefa por vez.
