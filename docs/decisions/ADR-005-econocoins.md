# ADR-005 - EconoCoins

- Status: Aceito provisoriamente para MVP
- Data: 2026-08-10

## Decisão

EconoCoins são pontos de gamificação sem valor monetário no MVP. A única ação inicialmente elegível será uma NFC-e válida e inédita: +100 pontos.

A comparação de preços não gera pontos.

## Ativação

A regra só entra em produção depois de o fluxo de NFC-e persistir documento, deduplicar e gerar evento idempotente no ledger.
