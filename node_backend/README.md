# EconoWay API

API Node.js + Express + TypeScript + PostgreSQL.

## Desenvolvimento

```bash
cp .env.example .env
npm ci
npm run typecheck
npm test
npm run build
npm run dev
```

## Organização

```text
src/
  controllers/   HTTP/adaptação
  routes/        roteamento/RBAC
  services/      casos de uso/orquestração
  repositories/  acesso a dados quando aplicável
  domain/        regras puras/testáveis
  security/      políticas de integração externa
  middleware/    auth, rate limit, headers, CSRF
  scripts/       migration/seeds
```

O backend é um monólito modular; não introduzir microservices sem requisito operacional concreto.

## Banco

Migrations 001-005 são para ambiente novo/estado alvo do Alpha. **Não aplicar no Neon existente sem reconciliação do schema atual.**

## Segurança

A aplicação falha ao iniciar sem `DATABASE_URL` e `JWT_SECRET` válido. Ver `../docs/security/security-baseline.md`.

## Contrato

`../docs/api/openapi.yaml` é o contrato canônico.

## NFC-e

A integração foi separada em:

- `nfceFetchService.ts`: fetch externo + política SSRF/redirect/content limits;
- `nfceParser.ts`: parsing do HTML suportado;
- `receiptService.ts`: regra/transação/persistência/EconoCoins;
- `nota.controller.ts`: camada HTTP e mapeamento de erros.

Mudança de HTML da SEFAZ deve ser tratada no parser e coberta por fixture anonimizada/regressiva.
