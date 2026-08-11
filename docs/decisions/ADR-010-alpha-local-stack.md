# ADR-010 - Stack local descartável para o Alpha

Status: Aceita

## Decisão

O desenvolvimento integrado usa Docker Compose com:

- PostgreSQL local descartável;
- migrations versionadas;
- seed demonstrativo idempotente;
- API Node;
- portal Web servido por Nginx.

O banco Neon existente **não** recebe as migrations alvo até seu DDL real ser exportado e reconciliado.

## Motivo

Precisamos demonstrar e testar o vertical slice sem depender de estado externo desconhecido nem arriscar dados existentes.
