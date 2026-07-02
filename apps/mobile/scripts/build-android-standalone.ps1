# Standalone release APK on Windows (no EAS cloud, no dev client).
# Re-generates android/ without expo-dev-client, then runs Gradle release.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not $env:EXPO_PUBLIC_API_URL) {
  $env:EXPO_PUBLIC_API_URL = "https://api.onetune.shribuilds.in/"
}

$env:EXPO_STANDALONE_BUILD = "1"
$env:EXPO_NO_METRO_WORKSPACE_ROOT = "1"

Write-Host "API URL: $env:EXPO_PUBLIC_API_URL"
Write-Host "Regenerating native Android project (standalone, no dev client)..."

npx expo prebuild --platform android --clean

Write-Host "Building release APK (this can take several minutes)..."

Set-Location android
.\gradlew.bat assembleRelease -x lint -x test
Set-Location ..

$apk = "android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apk) {
  Write-Host ""
  Write-Host "Done. Install this APK on your phone:"
  Write-Host (Resolve-Path $apk)
} else {
  Write-Error "APK not found at $apk"
}
