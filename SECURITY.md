# Segurança do EconoWay

## Escopo atual

Este repositório é um projeto acadêmico em evolução. A baseline Alpha contém controles de segurança, mas **não deve ser tratada como produção validada**.

## Reporte

Não publique credenciais, tokens, connection strings, dados pessoais ou conteúdo de NFC-e real em Issues públicas.

Se um problema de segurança for encontrado durante o trabalho acadêmico, compartilhe-o diretamente com os responsáveis do projeto e registre no repositório apenas a correção/sanitização necessária.

## Regras obrigatórias

- nunca versionar `.env` ou connection strings;
- JWT sem segredo configurado deve falhar no startup;
- não registrar senha/token/cookie de sessão em logs;
- API de produto usa HTTPS;
- endpoints B2B/Admin exigem autorização do backend;
- URLs NFC-e passam pela policy SSRF antes de qualquer request;
- queries com entrada externa devem ser parametrizadas;
- mudanças de segurança relevantes devem atualizar `docs/security/` e, quando arquiteturais, um ADR.

## Dados de teste

Use dados sintéticos ou anonimizados. NFC-e real pode conter dados pessoais/consumo e não deve ser incluída como fixture sem sanitização.
