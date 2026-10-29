# Atores e permissões

Os documentos acadêmicos e os protótipos convergem para três atores principais: **Usuário**, **Responsável do Supermercado** e **Administrador**.

## Usuário

Canal principal: Android.

Pode:

- gerenciar a própria conta;
- pesquisar produtos e supermercados;
- manter favoritos;
- montar carrinho;
- comparar preços;
- consultar o próprio histórico;
- enviar NFC-e para contribuir com preços;
- visualizar EconoCoins próprios quando o ledger estiver habilitado.

Não pode:

- alterar preço diretamente como fonte oficial de supermercado;
- aprovar supermercado;
- acessar dados de outros usuários;
- executar funções administrativas.

## Responsável do Supermercado

Canal principal: portal Web.

Pode somente sobre supermercados explicitamente vinculados à sua conta:

- consultar cadastro do estabelecimento;
- atualizar preços;
- importar preços;
- consultar erros e histórico de importação.

Não pode:

- gerenciar outro supermercado sem vínculo;
- administrar contas de consumidores;
- atribuir a si próprio privilégios administrativos.

## Administrador

Canal principal: portal Web.

Pode:

- aprovar/suspender supermercados;
- gerenciar vínculos de responsáveis;
- bloquear contas quando necessário;
- consultar auditoria e saúde operacional;
- aplicar ajustes administrativos devidamente auditados.

## Princípio

A UI muda por ator, mas **autorização é sempre imposta no backend**. Ocultar uma opção na interface não substitui RBAC/autorização no servidor.
