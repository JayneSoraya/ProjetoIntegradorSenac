# ADR-007 - Comparação como snapshot e transparência de frescor

Status: Aceita

## Contexto

A comparação de preços pode mudar imediatamente após uma atualização de oferta. O histórico acadêmico exige salvar comparações e o protótipo diferencia resultados completos e parciais.

## Decisão

- A API sempre recalcula a comparação no servidor; o cliente não é fonte de verdade para total/economia.
- Uma comparação só vira histórico após ação explícita de salvar.
- Ao salvar, a cesta e o resultado são persistidos como snapshot para preservar o contexto temporal.
- Mercados completos são ranqueados antes de mercados parciais.
- Preço ausente nunca é tratado como zero.
- Ofertas antigas permanecem visíveis, porém são sinalizadas como `desatualizado`; a janela inicial é configurável por `PRICE_FRESHNESS_HOURS` e começa em 168 horas.
- A economia potencial atual mantém a regra acadêmica existente: diferença entre o menor total e a média de até três mercados completos mais caros.

## Consequências

- Histórico não muda retroativamente quando o catálogo muda.
- O usuário consegue distinguir preço indisponível de preço antigo.
- Qualquer mudança na fórmula de economia deve ser versionada/documentada antes de alterar relatórios históricos.
