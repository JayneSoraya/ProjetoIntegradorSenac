# ADR-001 - Android primeiro

- Status: Aceito
- Data: 2026-08-10

## Contexto

O projeto Flutter gera múltiplas plataformas, mas manter qualidade simultânea em Android e iOS aumentaria escopo sem necessidade da próxima fase acadêmica.

## Decisão

Entregar e testar Android primeiro. iOS permanece tecnicamente possível por Flutter, mas não é gate do MVP.

## Consequências

- UX será avaliada prioritariamente em padrões Android/Material.
- CI prioriza Flutter/Android.
- código iOS gerado pode permanecer, mas bugs exclusivos de iOS não bloqueiam o MVP.
