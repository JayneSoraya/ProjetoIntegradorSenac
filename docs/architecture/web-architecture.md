# Arquitetura Web

## Papel decidido

O `web_frontend` não replica o aplicativo do consumidor. Ele é:

1. site institucional público;
2. portal do Responsável do Supermercado;
3. portal do Administrador.

O consumidor usa Android no Alpha/MVP.

## Autenticação e sessão

O portal usa JWT em cookie `HttpOnly`, `SameSite=Strict` e `Secure` em produção. O JavaScript do navegador não persiste nem lê o token. O backend mantém Bearer token para o aplicativo Android.

Mutações autenticadas por cookie passam por defesa de origem no backend. A autorização não depende de menus escondidos: endpoints administrativos e de supermercado verificam role e, no B2B, o vínculo ativo conta-supermercado.

## Rotas atuais

```text
/                              site institucional
/portal                        login B2B/admin
/admin                         dashboard ADMIN
/admin/usuarios                contas
/admin/supermercados           moderação
/admin/auditoria               trilha de auditoria
/supermercado                  dashboard + seletor de unidade
/supermercado/precos           catálogo/preço manual
/supermercado/importar         CSV/JSON com preview
/supermercado/importacoes      histórico
/supermercado/inconsistencias  fila de qualidade do catálogo
```

## Operação multiunidade

Uma conta `SUPERMERCADO` pode possuir vários vínculos ativos. O dashboard permite escolher a unidade antes de abrir preço, importação ou inconsistências. A autorização de cada unidade é revalidada no backend.

## Inconsistências

O Alpha não tenta mesclar produtos automaticamente por similaridade de nome. A fila operacional usa sinais objetivos:

- produto sem preço na unidade;
- preço além da janela de frescor configurada;
- preço de fidelidade maior que o preço normal.

A deduplicação semântica é futura porque merge automático incorreto corromperia catálogo e histórico.

## Direção responsiva

O portal deve aproveitar viewport maior com tabelas, filtros e panes quando adequado, mas degradar para uma coluna no mobile. O portal móvel é conveniência operacional, não substituto do Android consumidor.
