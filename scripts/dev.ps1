$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> Installing dependencies..."
bun install

Write-Host "==> Starting Docker services..."
docker compose up --build -d

Write-Host "==> Waiting for API health..."
do {
  Start-Sleep -Seconds 2
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    $healthy = $response.StatusCode -eq 200
  } catch {
    $healthy = $false
  }
} until ($healthy)

Write-Host "==> OneTune stack is ready."
Write-Host "    API:       http://localhost:3000/health"
Write-Host "    MongoDB:   localhost:27017"
Write-Host ""
Write-Host "==> Starting mobile dev server..."
bun run dev --filter=@OneTune/mobile
