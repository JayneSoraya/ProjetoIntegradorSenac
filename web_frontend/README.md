# EconoWay Web

React/Vite para:

1. site institucional;
2. Portal do Responsável do Supermercado;
3. Portal Administrativo.

O consumidor usa o aplicativo Android.

## Executar

```bash
cp .env.example .env
npm ci
npm run lint
npm run build
npm run dev
```

Variável:

```text
VITE_API_URL=http://localhost:3333/api
```

## Sessão

O portal usa cookie HttpOnly emitido pela API. Não persistir JWT em `localStorage` ou `sessionStorage`.

## Funcionalidades Alpha

Supermercado:

- unidades vinculadas;
- catálogo paginado;
- atualização manual de preço/fidelidade;
- validação/importação CSV/JSON;
- histórico de importações.

Admin:

- indicadores;
- usuários/ativação;
- moderação de supermercados;
- auditoria.

Toda proteção visual possui proteção equivalente na API; esconder menu não é controle de autorização.

## Operação de qualidade do catálogo

`/supermercado/inconsistencias?market=<id>` apresenta a fila objetiva de produtos sem preço, preço além da janela de frescor e preço de fidelidade maior que o normal. Não há merge automático por similaridade de nome no Alpha.
