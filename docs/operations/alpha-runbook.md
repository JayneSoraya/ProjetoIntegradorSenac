# Runbook do Alpha local

## Objetivo

Subir um ambiente descartável e executar o principal fluxo demonstrável sem tocar no Neon existente.

## 1. Preparar segredos locais

Na raiz:

```bash
cp .env.compose.example .env.compose
```

Edite todos os valores. Não reutilize credenciais reais. `JWT_SECRET` deve ter no mínimo 32 caracteres.

## 2. Subir API + PostgreSQL + Web

```bash
docker compose --env-file .env.compose up --build
```

Esperado:

- API: `http://localhost:3333/api/health`
- readiness: `http://localhost:3333/api/ready`
- Web: `http://localhost:5173`

O Compose espera PostgreSQL ficar saudável antes da API e a API ficar pronta antes do Web.

## 3. Executar Android

No emulador Android:

```bash
cd econoway_app
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3333/api
```

Em aparelho físico, use endereço local alcançável somente em build debug. Release exige HTTPS.

## 4. Smoke B2C

1. cadastrar/login como consumidor;
2. buscar produto por nome/código;
3. adicionar itens e alterar quantidades;
4. abrir carrinho;
5. selecionar/favoritar mercados;
6. comparar;
7. confirmar que resultado parcial não aparece como menor cesta completa;
8. salvar comparação;
9. abrir histórico;
10. consultar home/resumo;
11. opcional: testar NFC-e SP válida e inédita em ambiente controlado.

## 5. Smoke supermercado

1. entrar no Portal com a credencial demo definida localmente;
2. abrir unidade vinculada;
3. buscar catálogo e navegar páginas;
4. alterar preço unitário;
5. validar arquivo CSV/JSON;
6. revisar preview/erros;
7. confirmar importação;
8. consultar histórico.

## 6. Smoke admin

1. entrar com conta ADMIN demo;
2. conferir indicadores;
3. bloquear/reativar uma conta que não seja a própria;
4. alterar status de supermercado;
5. consultar auditoria.

## 7. Encerrar

```bash
docker compose --env-file .env.compose down
```

Para descartar também dados locais:

```bash
docker compose --env-file .env.compose down -v
```
