$ErrorActionPreference = "Stop"

$container = if ($env:MONGODB_CONTAINER) { $env:MONGODB_CONTAINER } else { "vibevault-mongodb" }
$db = if ($env:MONGO_INITDB_DATABASE) { $env:MONGO_INITDB_DATABASE } else { "vibevault" }
$stamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$outDir = "backups/vibevault-$stamp"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host "Backing up $db from $container -> $outDir" -ForegroundColor Cyan

docker exec $container mongodump --db $db --out "/data/db-backup-$stamp"
docker cp "${container}:/data/db-backup-$stamp/$db" $outDir
docker exec $container rm -rf "/data/db-backup-$stamp"

Write-Host "Backup complete: $outDir" -ForegroundColor Green
