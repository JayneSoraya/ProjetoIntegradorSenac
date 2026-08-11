# EconoWay — Artifact Manifest

Baseline: `0.4.0-alpha.4`

Este pacote é uma **cópia de trabalho revisada**. Não contém `.git`, `node_modules`, builds ou `.env` reais quando distribuído como ZIP final.

## Estado

- Android Flutter: consumidor;
- Node/Express/TypeScript: API;
- PostgreSQL: persistência alvo;
- React/Vite: landing + supermercado + admin;
- `docs/`: documentação canônica para Obsidian.

## Importante

- não executar migrations 001-005 no Neon existente antes de exportar/reconciliar o schema;
- executar `docs/operations/release-checklist.md` antes de promoção de ambiente;
- ver `docs/roadmap/execution-report-2026-08-10-alpha4.md` para gates realmente executados e bloqueios.
