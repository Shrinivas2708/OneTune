# Standalone release APK on Windows (no EAS cloud, no dev client).
# Re-generates android/ without expo-dev-client, then runs Gradle release.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
. "$PSScriptRoot\android-apk-output.ps1"

function Get-RepoRoot {
  return (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
}

function Remove-SubstDrives {
  foreach ($letter in @("O", "P", "Q", "R", "S", "T")) {
    $drive = "${letter}:"
    subst $drive /d 2>$null | Out-Null
  }
}

function Stop-GradleAndCleanCaches {
  param([string]$RepoRoot)

  $androidDir = Join-Path $PSScriptRoot "..\android"
  if (Test-Path $androidDir) {
    Push-Location $androidDir
    try {
      Write-Host "Stopping Gradle daemons..."
      & .\gradlew.bat --stop 2>$null
      Start-Sleep -Seconds 2
    } finally {
      Pop-Location
    }
  }

  $cachePaths = @(
    (Join-Path $RepoRoot "node_modules\expo-modules-core\android\build"),
    (Join-Path $androidDir "app\.cxx"),
    (Join-Path $androidDir "app\build"),
    (Join-Path $RepoRoot "node_modules\react-native-reanimated\android\.cxx"),
    (Join-Path $RepoRoot "node_modules\react-native-gesture-handler\android\build")
  )

  foreach ($cachePath in $cachePaths) {
    if (Test-Path $cachePath) {
      Write-Host "Clearing $cachePath"
      Remove-Item -Recurse -Force $cachePath -ErrorAction SilentlyContinue
    }
  }
}

Remove-SubstDrives

$repoRoot = Get-RepoRoot

if (-not $env:EXPO_PUBLIC_API_URL) {
  $env:EXPO_PUBLIC_API_URL = "https://api.onetune.shribuilds.in"
}

$env:EXPO_STANDALONE_BUILD = "1"
$env:EXPO_NO_METRO_WORKSPACE_ROOT = "1"
$env:NODE_ENV = "production"

Write-Host "API URL: $env:EXPO_PUBLIC_API_URL"
Write-Host "App version: $(Get-OneTuneAppVersion)"
Write-Host "Generating padded launcher icon..."
node ./scripts/generate-adaptive-icon.cjs

Write-Host "Regenerating native Android project (standalone, no dev client)..."
bunx expo prebuild --platform android --clean

Stop-GradleAndCleanCaches -RepoRoot $repoRoot

Write-Host "Building release APK (this can take 10-15 minutes)..."
Set-Location android
.\gradlew.bat clean assembleRelease -x lint -x test
Set-Location ..

$apk = Find-ReleaseApk
if (-not $apk) {
  Write-Error "APK not found in android\app\build\outputs\apk\release (expected OneTune-<version>-release.apk)"
}

$uploadApk = Copy-UploadApk -SourceApk $apk

Write-Host ""
Write-Host "Done. Install on your phone:"
Write-Host $apk
Write-Host ""
Write-Host "Upload to GitHub Releases as:"
Write-Host $uploadApk
