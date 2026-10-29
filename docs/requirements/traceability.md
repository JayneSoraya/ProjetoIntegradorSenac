# Matriz de rastreabilidade

Fonte funcional principal do Alpha: documento acadêmico mais recente de 2026 + protótipos recebidos.

Status: `OK`, `PARCIAL`, `PENDENTE`, `FUTURO`, `BLOQUEADO`.

| Capacidade | Origem | Backend | Android/Web | Evidência/teste | Status |
|---|---|---|---|---|---|
| Cadastro consumidor | caso de uso/login | `/auth/cadastro` | Android cadastro | validação backend; runtime pendente | PARCIAL |
| Login consumidor | protótipo p.3 | `/auth/login` | Android | rate-limit/auth revisados | PARCIAL |
| Recuperar senha | protótipo p.3 | placeholder 501 | ação removida do Alpha para não mentir | nenhum | PENDENTE |
| Buscar por nome/categoria/código | caso principal + p.12 | `GET /produtos` | busca server-side debounced | DTO test | PARCIAL |
| Adicionar/alterar/remover carrinho | caso principal | `GET/PUT/DELETE /carrinho` | Android reativo | `cart` + Flutter cart tests | PARCIAL |
| Carrinho vazio não compara | caso alternativo + p.2 | validação de domínio | estado vazio Android | test de carrinho/domínio | OK lógica |
| Barra persistente do carrinho | p.12 | n/a | Android produtos | inspeção/runtime pendente | PARCIAL |
| Selecionar vários mercados | caso principal + p.1/p.5 | IDs opcionais na comparação | Android seleção múltipla | domínio comparison | PARCIAL |
| Favoritar mercado | p.1/p.4 | endpoints favoritos | Android | runtime pendente | PARCIAL |
| Mercados próximos | p.1/p.4 | Haversine + perfil salvo | Android mostra distância quando disponível | runtime/localização real pendente | PARCIAL |
| Mesmos produtos/quantidades | regra acadêmica | comparação parte da cesta normalizada | Android envia cesta | testes `cart/comparison` | OK lógica |
| Menor total destacado | regra acadêmica + p.6 | ranking server-side | tela comparação | test comparison | OK lógica |
| Comparação parcial explícita | caso alternativo + p.13 | faltantes/cobertura | tela comparação | test comparison | OK lógica |
| Preço desatualizado explícito | melhoria técnica | metadata de frescor | aviso Android | runtime pendente | PARCIAL |
| Fidelidade | p.5/p.6 | `preco_fidelidade` | comparação/portal | runtime pendente | PARCIAL |
| Economia estimada | regra acadêmica | cálculo server-side | resultado/home | test comparison | OK lógica |
| Salvar comparação | caso principal + p.6 | `salvar=true`, snapshot | botão salvar | runtime pendente | PARCIAL |
| Histórico | p.4/p.6 | `/comparacao/historico` e detalhe | Android histórico | runtime pendente | PARCIAL |
| NFC-e | evolução atual | `/notas/processar` | scanner | policy URL/CNPJ + parser tests | PARCIAL |
| Deduplicar NFC-e | antifraude | chave/hash único | resposta 409 | runtime DB pendente | PARCIAL |
| EconoCoins contribuição | gamificação | ledger +100 por nota inédita válida | scanner/home | runtime DB pendente | PARCIAL |
| Portal supermercado | atores + p.10 | vínculo/RBAC | Web | build pendente | PARCIAL |
| Atualizar preço unitário | p.11 | PUT preço + auditoria | Web tabela | runtime pendente | PARCIAL |
| Importar tabela | p.7/p.8 | valida/aplica CSV/JSON | Web preview | `priceImport` test | PARCIAL |
| Histórico de importações | p.10 | GET importações | Web | runtime pendente | PARCIAL |
| Inconsistências de catálogo | p.10 | `GET /supermercados/{id}/inconsistencias` | Web fila + contador | sintaxe/contrato; runtime DB pendente | PARCIAL |
| Operação multiunidade | separação por ator | vínculo por unidade | seletor Web + autorização por vínculo | runtime pendente | PARCIAL |
| Admin dashboard | p.9 | `/admin/resumo` | Web | runtime pendente | PARCIAL |
| Gerenciar usuários | p.9 | busca/status | Web | runtime pendente | PARCIAL |
| Moderar mercados | p.9 | status mercado | Web | runtime pendente | PARCIAL |
| Auditoria | requisito operacional | `/admin/auditoria` | Web | runtime pendente | PARCIAL |
| Exportar/excluir dados pessoais | melhoria de privacidade | `/usuario/me*` | API Alpha | runtime pendente | PARCIAL |
| Otimização compra dividida | decisão futura | não implementado | não exposto | - | FUTURO |
| iOS | decisão de escopo | - | - | - | FUTURO |

## Critério de `OK` completo

Um item só deve virar `OK` sem qualificador quando possuir contrato, implementação, gate automatizado relevante e smoke/integration test executado no ambiente alvo. Por isso vários itens funcionalmente implementados permanecem `PARCIAL` enquanto os runtimes não foram executados nesta máquina.
