param(
  [string]$Output
)

if (-not $env:DATABASE_URL) {
  throw "Defina DATABASE_URL com a connection string do Neon antes de executar."
}

if (-not $Output) {
  $Output = Join-Path $PSScriptRoot "../../../docs/database/schema-current.sql"
}

$Output = [System.IO.Path]::GetFullPath($Output)
$OutputDirectory = Split-Path -Parent $Output
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

pg_dump --schema-only --no-owner --no-privileges --file $Output $env:DATABASE_URL
if ($LASTEXITCODE -ne 0) {
  throw "pg_dump falhou com exit code $LASTEXITCODE"
}

Write-Host "Schema exportado para $Output"
