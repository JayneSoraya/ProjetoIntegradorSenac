# ADR-012 - Operações técnicas de dados pessoais no Alpha

Status: Aceita

## Decisão

O backend oferece para o consumidor autenticado:

- consultar perfil;
- atualizar dados opcionais de perfil/localização;
- exportar snapshot JSON dos dados vinculados;
- excluir a própria conta mediante confirmação de senha.

Exportação/exclusão possuem rate limit adicional.

## Limite da decisão

Essas funções facilitam direitos operacionais e reduzem dívida futura, mas **não constituem, por si só, conformidade LGPD**. Base legal, avisos, retenção, atendimento de titular, anonimização, contratos, segurança organizacional e eventuais obrigações regulatórias exigem análise própria antes de produção real.
