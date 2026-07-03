# Standalone release APK on Windows (no EAS cloud, no dev client).
# Re-generates android/ without expo-dev-client, then runs Gradle release.

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\android-apk-output.ps1"

function Get-RepoRoot {
  return (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
}

function Enable-ShortBuildPath {
  param([string]$RepoRoot)

  if ($env:OS -notmatch "Windows") {
    return @{
      MobileDir = (Join-Path $RepoRoot "apps\mobile")
      Created   = $false
      Drive     = $null
    }
  }

  foreach ($letter in @("O", "P", "Q", "R", "S", "T")) {
    $drive = "${letter}:"
    if (-not (Test-Path $drive)) {
      subst $drive $RepoRoot | Out-Null
      return @{
        MobileDir = "$drive\apps\mobile"
        Created   = $true
        Drive     = $drive
      }
    }
  }

  Write-Warning "No free drive letter for SUBST; building from long path (CMake may warn)."
  return @{
    MobileDir = (Join-Path $RepoRoot "apps\mobile")
    Created   = $false
    Drive     = $null
  }
}

function Stop-GradleAndCleanLocks {
  param([string]$MobileDir)

  $androidDir = Join-Path $MobileDir "android"
  if (-not (Test-Path $androidDir)) {
    return
  }

  Push-Location $androidDir
  try {
    Write-Host "Stopping Gradle daemons..."
    & .\gradlew.bat --stop 2>$null
    Start-Sleep -Seconds 2
  } finally {
    Pop-Location
  }

  $repoRoot = (Resolve-Path (Join-Path $MobileDir "..\..")).Path
  $expoCoreBuild = Join-Path $repoRoot "node_modules\expo-modules-core\android\build"
  if (Test-Path $expoCoreBuild) {
    Write-Host "Clearing stale expo-modules-core build cache..."
    Remove-Item -Recurse -Force $expoCoreBuild -ErrorAction SilentlyContinue
  }

  $cxxDir = Join-Path $androidDir "app\.cxx"
  if (Test-Path $cxxDir) {
    Remove-Item -Recurse -Force $cxxDir -ErrorAction SilentlyContinue
  }
}

$repoRoot = Get-RepoRoot
$shortPath = Enable-ShortBuildPath -RepoRoot $repoRoot
$mobileDir = $shortPath.MobileDir

try {
  Set-Location $mobileDir

  if (-not $env:EXPO_PUBLIC_API_URL) {
    $env:EXPO_PUBLIC_API_URL = "https://api.onetune.shribuilds.in"
  }

  $env:EXPO_STANDALONE_BUILD = "1"
  $env:EXPO_NO_METRO_WORKSPACE_ROOT = "1"

  Write-Host "API URL: $env:EXPO_PUBLIC_API_URL"
  Write-Host "App version: $(Get-OneTuneAppVersion)"
  Write-Host "Build directory: $mobileDir"
  Write-Host "Generating padded launcher icon..."
  node ./scripts/generate-adaptive-icon.cjs
  Write-Host "Regenerating native Android project (standalone, no dev client)..."

  npx expo prebuild --platform android --clean

  Stop-GradleAndCleanLocks -MobileDir $mobileDir

  Write-Host "Building release APK (this can take several minutes)..."
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
} finally {
  if ($shortPath.Created -and $shortPath.Drive) {
    Set-Location $env:USERPROFILE
    subst $shortPath.Drive /d | Out-Null
  }
}
