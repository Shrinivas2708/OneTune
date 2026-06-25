# Unified search smoke test — requires Docker stack + registered user
# Usage: .\scripts\test-search.ps1

$BaseUrl = if ($env:API_URL) { $env:API_URL } else { "http://localhost:3000" }
$Email = if ($env:TEST_EMAIL) { $env:TEST_EMAIL } else { "search@vibevault.local" }
$Password = if ($env:TEST_PASSWORD) { $env:TEST_PASSWORD } else { "password123" }

function Get-AccessToken {
  $loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
  try {
    $auth = Invoke-RestMethod -Uri "$BaseUrl/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    return $auth.data.tokens.accessToken
  } catch {
    $registerBody = @{
      email = $Email
      password = $Password
      displayName = "Search Tester"
    } | ConvertTo-Json
    $auth = Invoke-RestMethod -Uri "$BaseUrl/v1/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    return $auth.data.tokens.accessToken
  }
}

$token = Get-AccessToken
$headers = @{ Authorization = "Bearer $token" }

Write-Host "==> Unified search"
$query = [uri]::EscapeDataString("believer")
$search = Invoke-RestMethod -Uri "$BaseUrl/v1/search?q=$query&limit=10" -Headers $headers
Write-Host "  Providers queried: $($search.data.providersQueried -join ', ')"
Write-Host "  Providers failed: $($search.data.providersFailed -join ', ')"
Write-Host "  Results: $($search.data.results.Count)"
$search.data.results | Select-Object -First 3 | ForEach-Object {
  Write-Host "    [$($_.providerId)] $($_.title) — $($_.artists[0].name)"
}

$playable = $search.data.results | Where-Object { $_.providerId -in @("jiosaavn", "youtube") } | Select-Object -First 1
if ($null -eq $playable) {
  Write-Host "No playable result found for stream test."
  exit 0
}

Write-Host "`n==> Track metadata"
$meta = Invoke-RestMethod -Uri "$BaseUrl/v1/tracks/$($playable.providerId)/$($playable.ref.externalId)" -Headers $headers
Write-Host "  $($meta.data.title)"

Write-Host "`n==> Stream resolve ($($playable.providerId))"
$streamBody = @{
  trackRef = @{
    providerId = $playable.providerId
    externalId = $playable.ref.externalId
    url = $playable.ref.url
  }
} | ConvertTo-Json -Depth 5
$stream = Invoke-RestMethod -Uri "$BaseUrl/v1/stream/resolve" -Method POST -Body $streamBody -ContentType "application/json" -Headers $headers
Write-Host "  URL: $($stream.data.url.Substring(0, [Math]::Min(80, $stream.data.url.Length)))..."

Write-Host "`nSearch smoke test passed."
