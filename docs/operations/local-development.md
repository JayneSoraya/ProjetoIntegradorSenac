# Desenvolvimento local

## Caminho recomendado - Alpha integrado com Compose

Pré-requisitos: Docker Engine/Desktop com Compose.

```bash
cp .env.compose.example .env.compose
# edite todos os valores/segredos
docker compose --env-file .env.compose up --build
```

Serviços:

- PostgreSQL local: `localhost:5432`;
- API: `http://localhost:3333`;
- Web: `http://localhost:5173`.

O Compose executa migrations e seed demo no PostgreSQL local. Credenciais demo são definidas por você em `.env.compose`; não há senha demo fixa commitada.

Para reset completo:

```bash
docker compose --env-file .env.compose down -v
```

Veja [[operations/alpha-runbook]].

## Backend isolado

```bash
cd node_backend
cp .env.example .env
npm ci
npm run typecheck
npm test
npm run build
npm run dev
```

Variáveis mínimas: `DATABASE_URL` e `JWT_SECRET` >= 32 caracteres.

## Android Flutter

```bash
cd econoway_app
flutter pub get
dart format lib test
flutter analyze
flutter test
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3333/api
```

`10.0.2.2` é o host visto pelo emulador Android. Em aparelho físico, passe um endereço alcançável em debug. Build de produção exige HTTPS.

> [!important]
> O `pubspec.lock` precisa ser regenerado por `flutter pub get` em ambiente com Flutter disponível; ele não foi editado manualmente.

## Web isolado

```bash
cd web_frontend
cp .env.example .env
npm ci
npm run lint
npm run build
npm run dev
```

`VITE_API_URL` deve apontar para a API e a origem Web precisa constar em `CORS_ORIGINS`.

## Banco Neon existente

**Não execute `001`-`004` no Neon atual antes de exportar/reconciliar o schema existente.**

Siga [[database/current-schema]]. As migrations atuais descrevem um ambiente novo/estado alvo do Alpha.
