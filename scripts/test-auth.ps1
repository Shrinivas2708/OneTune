# Auth flow smoke test — requires MongoDB running (docker compose up -d mongodb)
# Usage: .\scripts\test-auth.ps1

$BaseUrl = if ($env:API_URL) { $env:API_URL } else { "http://localhost:3000" }

Write-Host "==> Register"
$registerBody = @{
  email = "test@OneTune.local"
  password = "password123"
  displayName = "Test User"
} | ConvertTo-Json

try {
  $register = Invoke-RestMethod -Uri "$BaseUrl/v1/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
} catch {
  Write-Host "Register failed (user may exist), trying login..."
  $loginBody = @{
    email = "test@OneTune.local"
    password = "password123"
  } | ConvertTo-Json
  $register = Invoke-RestMethod -Uri "$BaseUrl/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
}

$accessToken = $register.data.tokens.accessToken
$refreshToken = $register.data.tokens.refreshToken

Write-Host "==> GET /v1/auth/me"
$me = Invoke-RestMethod -Uri "$BaseUrl/v1/auth/me" -Headers @{ Authorization = "Bearer $accessToken" }
Write-Host "User: $($me.data.email)"

Write-Host "==> Refresh token"
$refreshBody = @{ refreshToken = $refreshToken } | ConvertTo-Json
$refreshed = Invoke-RestMethod -Uri "$BaseUrl/v1/auth/refresh" -Method POST -Body $refreshBody -ContentType "application/json"
Write-Host "New access token received: $($refreshed.data.tokens.accessToken.Substring(0, 20))..."

Write-Host "==> Logout"
$logoutBody = @{ refreshToken = $refreshed.data.tokens.refreshToken } | ConvertTo-Json
Invoke-RestMethod -Uri "$BaseUrl/v1/auth/logout" -Method POST -Body $logoutBody -ContentType "application/json"
Write-Host "Auth smoke test passed."
