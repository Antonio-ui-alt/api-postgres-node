$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$oldContainer = docker ps --filter 'name=^/postgres$' --format '{{.Names}}'
if ($LASTEXITCODE -ne 0) {
  throw 'No se pudo acceder a Docker. Abre Docker Desktop y vuelve a ejecutar este script.'
}
if ($oldContainer) {
  docker stop postgres
  if ($LASTEXITCODE -ne 0) {
    throw 'No se pudo detener el contenedor postgres anterior.'
  }
}

docker compose up -d db
if ($LASTEXITCODE -ne 0) {
  throw 'No se pudo iniciar PostgreSQL en el puerto 5433.'
}

$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
  docker exec api-postgres-db pg_isready -U postgres -d postgres *> $null
  if ($LASTEXITCODE -eq 0) {
    $ready = $true
    break
  }
  Start-Sleep -Seconds 1
}
if (-not $ready) {
  throw 'PostgreSQL no quedó listo dentro del tiempo esperado.'
}

docker exec api-postgres-db psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
if ($LASTEXITCODE -ne 0) {
  throw 'No se pudo sincronizar la contraseña local de PostgreSQL.'
}

Get-Content -Raw -Encoding UTF8 .\src\db\schema.sql | docker exec -i api-postgres-db psql -U postgres -d postgres
if ($LASTEXITCODE -ne 0) {
  throw 'No se pudo cargar el esquema.'
}

if (-not (Test-Path .\node_modules)) {
  npm install
  if ($LASTEXITCODE -ne 0) {
    throw 'Falló npm install.'
  }
}

$listening = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $listening) {
  $listening = netstat -ano -p tcp | Select-String -Pattern '^\s*TCP\s+\S*:3000\s+\S+\s+LISTENING\s+\d+'
}

if ($listening) {
  Write-Host 'PostgreSQL está listo en localhost:5433. El puerto 3000 ya está ocupado; verifica http://localhost:3000/api/health.'
} else {
  Write-Host 'Iniciando la API en http://localhost:3000'
  npm run dev
}
