# Schema PostgreSQL atual - como obter

## Situação

O schema **real do banco Neon ainda não está versionado neste repositório**. Os artefatos acadêmicos possuem um DDL antigo com sintaxe predominantemente MySQL (`AUTO_INCREMENT`, `DATETIME`), enquanto o backend atual utiliza PostgreSQL. Portanto, esse DDL histórico é referência de domínio, não fonte confiável para aplicar no Neon.

## Opção recomendada - exportar com pg_dump

No Neon Console, abra o projeto e use **Connect** para copiar a connection string do banco correto.

No PowerShell, sem salvar a senha em arquivo, você pode usar o script que já deixei no projeto:

```powershell
$env:DATABASE_URL = 'COLE_A_CONNECTION_STRING_DO_NEON_AQUI'
.\node_backend\database\introspection\export-schema.ps1
Remove-Item Env:DATABASE_URL
```

O script chama `pg_dump --schema-only --no-owner --no-privileges` e grava automaticamente em `docs/database/schema-current.sql`. Se preferir executar manualmente:

```powershell
pg_dump --schema-only --no-owner --no-privileges --file .\docs\database\schema-current.sql $env:DATABASE_URL
```

O resultado `schema-current.sql` deve ser commitado depois de remover qualquer dado sensível acidental. `--schema-only` exporta estrutura, índices, constraints, sequences e demais objetos, sem linhas de negócio.

> [!warning]
> Não aplique `node_backend/database/migrations/001_core_schema.sql` no banco existente antes de comparar o dump atual. As migrations criadas nesta revisão definem o **schema alvo para ambiente novo**, não uma migração cega do Neon existente.

## Se pg_dump não estiver instalado

No Neon Console, a área **Tables** permite inspecionar schemas, tabelas, colunas e objetos. Para inventário rápido, execute no SQL Editor:

```sql
SELECT
  table_schema,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name, ordinal_position;
```

Constraints:

```sql
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid, true) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, c.relname, con.conname;
```

Índices:

```sql
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename, indexname;
```

## Próximo passo obrigatório

Quando `schema-current.sql` existir:

1. comparar com as migrations alvo `001_core_schema.sql` a `005_market_catalog_membership.sql`;
2. identificar tabelas/colunas legadas;
3. criar migrations incrementais e não destrutivas;
4. fazer backup/snapshot antes de aplicar;
5. testar em branch/banco de homologação antes do banco utilizado pelo time.
