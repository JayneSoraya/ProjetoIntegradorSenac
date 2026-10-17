# ADR-009 - Importação de preços com validação e publicação transacional

Status: Aceita

## Decisão

O Alpha aceita `CSV` e `JSON`. `TXT` não é suportado inicialmente.

Fluxo:

```text
arquivo
 -> parse local no portal
 -> validação server-side obrigatória
 -> preview + erros por linha + checksum
 -> confirmação humana
 -> transação PostgreSQL set-based
 -> histórico/auditoria
```

Regras:

- máximo de 4 MB no portal;
- máximo de 5.000 registros por lote;
- CSV aceita delimitador vírgula ou ponto e vírgula;
- códigos duplicados no mesmo lote são rejeitados;
- preço precisa ser positivo e finito;
- o servidor valida novamente todo o lote;
- um lote concluído/processando com o mesmo checksum não é reaplicado;
- uma tentativa falha permanece registrada e pode ser repetida após correção;
- publicação de produtos/ofertas é atômica.

## Motivo

Upload direto para o banco produziria estado parcial, baixa auditabilidade e maior risco operacional.
