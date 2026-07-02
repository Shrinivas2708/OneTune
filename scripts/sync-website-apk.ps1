$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$destDir = Join-Path $root "website\downloads"
$destApk = Join-Path $destDir "OneTune-1.0.0.apk"

$candidates = @(
  Join-Path $root "apps\mobile\android\app\build\outputs\apk\release\OneTune-1.0.0.apk",
  Join-Path $root "apps\mobile\android\app\build\outputs\apk\release\OneTune-1.0.0-release.apk",
  Join-Path $root "apps\mobile\android\app\build\outputs\apk\release\app-release.apk"
)

New-Item -ItemType Directory -Force -Path $destDir | Out-Null

$source = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $source) {
  Write-Error "No APK found. Build first: cd apps/mobile && bun run build:android:standalone"
}

Copy-Item -Force $source $destApk
Write-Host "Copied to $destApk"
