# ADR-006 - Importação de preços

- Status: Aceito
- Data: 2026-08-10

## Decisão

A importação é funcionalidade do portal Web do supermercado.

Formatos MVP:

- CSV;
- JSON.

TXT separado foi removido do MVP. Arquivo texto delimitado já pode ser representado como CSV; um terceiro parser sem caso de negócio específico aumenta risco e manutenção.

## Fluxo obrigatório

`selecionar -> validar -> preview -> confirmar -> processar -> resultado/histórico`.

O upload nunca deve publicar preços diretamente sem validação.
