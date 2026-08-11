# ADR-003 - Monólito modular

- Status: Aceito
- Data: 2026-08-10

## Decisão

Manter um único backend Node.js, organizado em módulos. Não adotar microservices no MVP.

## Motivo

O domínio ainda está sendo estabilizado, o time é pequeno e não existe requisito operacional que justifique distribuição. O custo de deploy, observabilidade, consistência e debugging de microservices seria maior que o benefício atual.
