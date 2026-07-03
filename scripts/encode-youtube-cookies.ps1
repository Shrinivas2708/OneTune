# Export YouTube cookies and print a base64 string for Render env vars.
# Usage:
#   .\scripts\encode-youtube-cookies.ps1
#   .\scripts\encode-youtube-cookies.ps1 -Browser edge

param(
    [string]$Browser = "chrome",
    [string]$OutputPath = "secrets/youtube-cookies.txt"
)

$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$cookiePath = Join-Path $root $OutputPath
$secretsDir = Split-Path $cookiePath -Parent

if (-not (Test-Path $secretsDir)) {
    New-Item -ItemType Directory -Path $secretsDir | Out-Null
}


if (-not (Test-Path $cookiePath)) {
    throw "Cookie file was not created at $cookiePath"
}

$bytes = [System.IO.File]::ReadAllBytes($cookiePath)
$encoded = [Convert]::ToBase64String($bytes)

Write-Host ""
Write-Host "=== Local file ===" -ForegroundColor Green
Write-Host $cookiePath
Write-Host ""
Write-Host "=== Render: paste this as YTDLP_COOKIES_BASE64 on onetune-extractor ===" -ForegroundColor Green
Write-Host $encoded
Write-Host ""
Write-Host "Then redeploy onetune-extractor (or Save Changes if auto-deploy is on)." -ForegroundColor Yellow
