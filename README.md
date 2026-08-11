# EconoWay

Projeto Integrador de Análise e Desenvolvimento de Sistemas do Centro Universitário Senac.

O EconoWay compara a mesma cesta de supermercado em diferentes estabelecimentos. O consumidor usa o aplicativo Android; supermercados e administradores trabalham pelo portal web.

## Estado atual

O projeto está em alpha técnico. O fluxo principal já está implementado:

```text
cadastro/login → produtos → carrinho persistente → mercados
→ comparação completa ou parcial → salvar → histórico
```

O banco Neon, o deploy HTTPS, o monitoramento e os backups de produção ainda precisam de uma rodada própria de validação. O ambiente local é o caminho recomendado para desenvolvimento.

## Estrutura

- `econoway_app/`: aplicativo Flutter para Android;
- `node_backend/`: API Node.js, TypeScript, domínio, migrations e testes;
- `web_frontend/`: site e portais de supermercado e administração;
- `docs/`: documentação técnica e registros de execução;
- `compose.yaml`: stack local da API, banco e frontend;
- `scripts/`: verificações e rotinas de desenvolvimento.

## Pré-requisitos

- Docker Desktop com Compose;
- Flutter 3.44 ou superior e Android SDK para o aplicativo;
- Node.js 20 ou superior para trabalhar diretamente na API ou no frontend;
- um dispositivo Android com depuração USB ou um emulador, quando for testar o aplicativo.

## Ambiente local

Copie o arquivo de exemplo, preencha os valores locais e suba a stack:

```bash
cp .env.compose.example .env.compose
docker compose --env-file .env.compose up --build
```

API:

- `GET /api/health` confirma que o processo está respondendo;
- `GET /api/ready` confirma que a aplicação está pronta para uso.

O passo a passo está em [`docs/operations/alpha-runbook.md`](docs/operations/alpha-runbook.md).

## Aplicativo Android

No emulador, a API local fica disponível por `10.0.2.2`:

```bash
cd econoway_app
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3333/api
```

No aparelho físico, mantenha a depuração USB autorizada e use o encaminhamento definido no script:

```powershell
.\scripts\test-android-physical.ps1 -Scenario smoke
```

O runbook de dispositivo físico explica a preparação, a limitação de rede e os cenários disponíveis.

## Testes e verificações

```bash
cd econoway_app
flutter analyze
flutter test
flutter build apk --debug
```

Para validar um fluxo no Android físico:

```powershell
.\scripts\test-android-physical.ps1 -Scenario auth
.\scripts\test-android-physical.ps1 -Scenario cart
.\scripts\test-android-physical.ps1 -Scenario comparison
```

Os relatórios de cada rodada ficam em `docs/roadmap/`.

## O que foi consolidado nesta rodada

- estado do carrinho passou a ser injetado pelo `CartScope`, sem singleton global;
- restauração do carrinho e contador da Home usam a mesma instância em toda a navegação;
- ações rápidas da Home foram extraídas para um widget responsivo;
- testes unitários cobrem subtotal, incremento, decremento, remoção e limpeza;
- testes de integração cobrem autenticação, carrinho, comparação, histórico e comparação parcial;
- o script de execução no Android físico passou a validar dispositivo autorizado, API e cenário antes de instalar o app.

O registro completo está em [`docs/roadmap/execution-report-2026-08-11-codex-phase6.md`](docs/roadmap/execution-report-2026-08-11-codex-phase6.md).

## Segurança e banco

O código já inclui JWT sem segredo padrão, RBAC, autorização por vínculo de supermercado, cookies web protegidos em produção, proteção CSRF/origin, rate limiting, armazenamento seguro no Android, proteção contra SSRF, SQL parametrizado, auditoria e IDs de requisição.

Não execute as migrations `001` a `005` diretamente no Neon existente. Antes, compare-as com o schema real conforme [`docs/database/current-schema.md`](docs/database/current-schema.md).

## Documentação

Comece pelo [`docs/00-INDEX.md`](docs/00-INDEX.md). Ele organiza os runbooks, decisões, riscos, arquitetura, banco e o roadmap para consulta no Obsidian.

## Licença

O arquivo `LICENSE` histórico contém termos específicos do trabalho e ainda precisa de revisão de titularidade e uso comercial. O backend permanece marcado como `UNLICENSED` para não criar uma interpretação diferente desses termos.
