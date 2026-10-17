# EconoCoins - política de produto

Status: **regra Alpha implementada; programa econômico/financeiro não existe**.

## Origem da decisão

Os artefatos históricos não traziam uma regra consolidada. O protótipo exibia `+100` por scan enquanto uma implementação antiga calculava pontos a partir de comparações. Essa inconsistência foi removida.

## Regra Alpha

EconoCoins são **pontos de gamificação, sem valor monetário e sem promessa de conversão**.

Evento elegível inicial:

- NFC-e válida, inédita, atribuída ao usuário e persistida com sucesso: **+100 pontos**.

Não geram pontos:

- abrir/salvar comparação;
- repetir a mesma NFC-e;
- cadastro/login;
- adicionar item ao carrinho.

## Implementação

- `nota_fiscal` usa chave de acesso/hash para deduplicação;
- persistência da nota, itens, atualização de preços e crédito acontecem na mesma transação;
- `econocoin_evento` é ledger; saldo é derivado da soma dos eventos;
- evento: `NFCE_VALIDADA`;
- política versionada: `2026-08-alpha1`;
- a UI mostra a quantidade efetivamente retornada pelo servidor.

## Riscos ainda abertos

Antes de qualquer recompensa de valor real:

1. antifraude além da deduplicação básica;
2. limites/regras de abuso por dispositivo/conta;
3. política de expiração, estorno e suporte;
4. revisão jurídica/contábil/tributária;
5. ADR específico para equivalência financeira.

Nada disso deve ser inferido a partir do termo "coin".
