# Provider smoke test — requires full Docker stack
# Usage: .\scripts\test-providers.ps1

$BaseUrl = if ($env:API_URL) { $env:API_URL } else { "http://localhost:3000" }

Write-Host "==> List providers"
$providers = Invoke-RestMethod -Uri "$BaseUrl/v1/internal/providers"
$providers.data.providers | ForEach-Object { Write-Host "  - $($_.id): $($_.displayName)" }

foreach ($providerId in @("youtube", "jiosaavn", "spotify")) {
  Write-Host "`n==> Search on $providerId"
  $encoded = [uri]::EscapeDataString("test")
  $search = Invoke-RestMethod -Uri "$BaseUrl/v1/internal/providers/$providerId/search?query=$encoded&limit=3"
  Write-Host "  Results: $($search.data.results.Count)"
  if ($search.data.results.Count -gt 0) {
    Write-Host "  First: $($search.data.results[0].title)"
  }
}

Write-Host "`nProvider smoke test complete."
