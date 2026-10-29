# ADR-011 - Evolução da seleção de tecnologias

Status: Aceita

## Contexto

Artefatos acadêmicos de 2025 citam Firebase/Firestore/Auth e Google Maps como opções da seleção inicial. O código real evoluiu para Flutter + API Node/Express/TypeScript + PostgreSQL.

## Decisão

A arquitetura canônica de 2026 é:

- Flutter no Android;
- Node.js/Express/TypeScript no backend;
- PostgreSQL;
- React/Vite no portal Web.

Os documentos antigos permanecem como histórico acadêmico e não devem ser editados retroativamente para fingir que a decisão original era outra.

## Justificativa

O sistema atual já possui domínio relacional forte (produto, oferta, mercado, carrinho, comparação, nota, importação e auditoria). Reescrever para Firebase agora não resolve um problema técnico concreto e adicionaria risco/desperdício. A mudança de tecnologia será justificada como evolução do projeto a partir de requisitos e implementação reais.
