# Re-bundle release APK with a fresh API URL (no full prebuild).
# Use when you changed .env / API URL and Android Studio didn't pick it up.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

. "$PSScriptRoot\android-apk-output.ps1"

$env:EXPO_PUBLIC_API_URL = "https://api.onetune.shribuilds.in"
$env:EXPO_NO_METRO_WORKSPACE_ROOT = "1"

Write-Host "API URL: $env:EXPO_PUBLIC_API_URL"
Write-Host "App version: $(Get-OneTuneAppVersion)"
Write-Host "Clearing old JS bundle cache..."

$cachePaths = @(
  "android\app\build",
  ".expo",
  "node_modules\.cache"
)

foreach ($path in $cachePaths) {
  if (Test-Path $path) {
    Remove-Item -Recurse -Force $path
    Write-Host "  removed $path"
  }
}

Write-Host "Rebuilding release APK..."
Set-Location android
.\gradlew.bat --stop
.\gradlew.bat :app:createBundleReleaseJsAndAssets --rerun-tasks
.\gradlew.bat assembleRelease -x lint -x test
Set-Location ..

$apk = Find-ReleaseApk
if (-not $apk) {
  Write-Error "APK not found in android\app\build\outputs\apk\release (expected OneTune-<version>-release.apk)"
}

$uploadApk = Copy-UploadApk -SourceApk $apk

Write-Host ""
Write-Host "Done. Install:"
Write-Host $apk
Write-Host ""
Write-Host "Upload to GitHub Releases as:"
Write-Host $uploadApk
