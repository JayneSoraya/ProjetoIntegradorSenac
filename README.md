<h4 align = "center">
    :construction: Projeto em construção :construction:
</h4>

# EconoWay

Projeto Integrador de Análise e Desenvolvimento de Sistemas do Centro Universitário Senac.

O EconoWay compara a mesma cesta de supermercado em diferentes estabelecimentos. O consumidor usa o aplicativo Android; supermercados e administradores trabalham pelo portal web.

---

# Badges

![CI Status](https://github.com/JayneSoraya/ProjetoIntegradorSenac/actions/workflows/ci.yml/badge.svg)
[![CodeQL Analysis](https://github.com/JayneSoraya/ProjetoIntegradorSenac/actions/workflows/codeql.yml/badge.svg)](https://github.com/JayneSoraya/ProjetoIntegradorSenac/actions/workflows/codeql.yml)
![License](https://img.shields.io/badge/License-CC%20BY%204.0-0B5345?style=flat&logo=creativecomms)

---

## Estado atual

O projeto está em alpha técnico. O fluxo principal já está implementado:

```text
cadastro/login → produtos → carrinho persistente → mercados
→ comparação completa ou parcial → salvar → histórico
```

O banco Neon, o deploy HTTPS, o monitoramento e os backups de produção ainda precisam de uma rodada própria de validação. O ambiente local é o caminho recomendado para desenvolvimento.

---

## Estrutura
<!--START_LANGS-->
🛠️ **Linguagens e Base**:
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg" width="24" height="24" /> **Dart (41.8%)** — Core do Aplicativo Mobile Flutter.
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="24" height="24" /> **TypeScript (23.9%)** — Lógica do Backend e API Node.js.
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" width="24" height="24" /> **HTML (23.4%)** — Estruturação de páginas.
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" width="24" height="24" /> **C++ (4.5%)** — Integração nativa do motor do Flutter.
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cmake/cmake-original.svg" width="24" height="24" /> **CMake (3.4%)** — Gerenciamento de compilação nativa.
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" width="24" height="24" /> **Python (1.1%)** — Código fonte do projeto.
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" width="24" height="24" /> **CSS (0.6%)** — Estilização web.
<!--END_LANGS-->

📱 **Mobile (Aplicativo):**  
Flutter | Dart | Provider/Controller | Secure Session Storage | Camera & NFC-e Scanner

🖼️ **Front-end Web (Portal & Landing Page):**  
React | Vite | TypeScript | Tailwind CSS | Framer Motion | Lucide Icons | Axios

⚙️ **Back-end (Servidor e API REST):**  
Node.js | Express | TypeScript | JWT Auth | Security Middleware & CSRF | REST API Contract

🗄️ **Banco de Dados, DevOps & Infraestrutura:**  
PostgreSQL | Neon Serverless | Firebird DB | Docker Compose | GitHub Actions (CI & CodeQL)

- `econoway_app/`: aplicativo Flutter para Android;
- `node_backend/`: API Node.js, TypeScript, domínio, migrations e testes;
- `web_frontend/`: site e portais de supermercado e administração;
- `docs/`: documentação técnica e registros de execução;
- `compose.yaml`: stack local da API, banco e frontend;
- `scripts/`: verificações e rotinas de desenvolvimento.

---

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

# Pessoas Contribuidoras

Contribuições são sempre bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

# Pessoas Desenvolvedoras do Projeto

| [<img src="https://avatars.githubusercontent.com/u/67378860?v=4" width=115 style="border-radius: 50%;"><br><sub>**Jayne Soraya**</sub>](https://github.com/JayneSoraya) | [<img src="https://avatars.githubusercontent.com/u/85366337?v=4" width=115 style="border-radius: 50%;"><br><sub>**Diego Rodrigues**</sub>](https://github.com/Yurtachi) | [<img src="https://avatars.githubusercontent.com/u/75775034?v=4" width=115 style="border-radius: 50%;"><br><sub>**Vinícius Santos**</sub>](https://github.com/itvinl) |
| :---: | :---: | :---: |
| Desenvolvedora Full-Stack | Desenvolvedor Full-Stack | Desenvolvedor Full-Stack |

## Licença

O arquivo `LICENSE` histórico contém termos específicos do trabalho e ainda precisa de revisão de titularidade e uso comercial. O backend permanece marcado como `UNLICENSED` para não criar uma interpretação diferente desses termos.
