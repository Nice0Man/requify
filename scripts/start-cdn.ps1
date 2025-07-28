# Requify CDN Startup Script for Windows
# Initializes and starts MinIO CDN container with NGINX proxy

$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"  
    Yellow = "Yellow"
    Blue = "Blue"
}

# Script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

Write-Host "🚀 Starting Requify CDN Infrastructure..." -ForegroundColor $Colors.Blue

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor $Colors.Red
    exit 1
}

# Check if docker-compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ docker-compose not found. Please install docker-compose." -ForegroundColor $Colors.Red
    exit 1
}

# Create necessary directories
Write-Host "📁 Creating data directories..." -ForegroundColor $Colors.Yellow
$DataDirs = @(
    "$RootDir\data\minio",
    "$RootDir\data\redis-cdn", 
    "$RootDir\data\nginx-cache",
    "$RootDir\data\nginx-logs"
)

foreach ($Dir in $DataDirs) {
    if (-not (Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
    }
}

# Load environment variables
$EnvFile = "$RootDir\deploy\env\cdn.env"
if (Test-Path $EnvFile) {
    Write-Host "📋 Loading CDN environment variables..." -ForegroundColor $Colors.Yellow
    # Load .env file (simplified for PowerShell)
    Get-Content $EnvFile | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object {
        $parts = $_ -split '=', 2
        if ($parts.Length -eq 2) {
            [Environment]::SetEnvironmentVariable($parts[0], $parts[1], 'Process')
        }
    }
} else {
    Write-Host "⚠️  CDN environment file not found, using defaults..." -ForegroundColor $Colors.Yellow
}

# Navigate to deploy directory
Set-Location "$RootDir\deploy\docker"

# Stop existing containers if running
Write-Host "🛑 Stopping existing CDN containers..." -ForegroundColor $Colors.Yellow
try {
    docker-compose down 2>$null
} catch {
    # Ignore errors if containers aren't running
}

# Pull latest images
Write-Host "📥 Pulling latest Docker images..." -ForegroundColor $Colors.Yellow
docker-compose pull

# Start CDN infrastructure
Write-Host "🔄 Starting CDN containers..." -ForegroundColor $Colors.Yellow
docker-compose up -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor $Colors.Yellow

# Check MinIO health
Write-Host "🔍 Checking MinIO status..." -ForegroundColor $Colors.Blue
$timeout = 60
$counter = 0
while ($counter -lt $timeout) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9000/minio/health/live" -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ MinIO is ready!" -ForegroundColor $Colors.Green
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep 2
    $counter += 2
}

if ($counter -ge $timeout) {
    Write-Host "❌ MinIO failed to start within $timeout seconds" -ForegroundColor $Colors.Red
    exit 1
}

# Check NGINX CDN health
Write-Host "🔍 Checking NGINX CDN status..." -ForegroundColor $Colors.Blue
$counter = 0
while ($counter -lt $timeout) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:80/cache-status" -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ NGINX CDN is ready!" -ForegroundColor $Colors.Green
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep 2
    $counter += 2
}

if ($counter -ge $timeout) {
    Write-Host "❌ NGINX CDN failed to start within $timeout seconds" -ForegroundColor $Colors.Red
    exit 1
}

# Check Redis CDN
Write-Host "🔍 Checking Redis CDN status..." -ForegroundColor $Colors.Blue
try {
    $redisCheck = docker exec requify_redis_cdn redis-cli ping 2>$null
    if ($redisCheck -eq "PONG") {
        Write-Host "✅ Redis CDN is ready!" -ForegroundColor $Colors.Green
    } else {
        Write-Host "❌ Redis CDN is not responding" -ForegroundColor $Colors.Red
    }
} catch {
    Write-Host "❌ Redis CDN is not responding" -ForegroundColor $Colors.Red
}

# Initialize MinIO buckets
Write-Host "🪣 Initializing MinIO buckets..." -ForegroundColor $Colors.Yellow
try {
    docker-compose --profile init up mc
    Write-Host "✅ MinIO buckets initialized!" -ForegroundColor $Colors.Green
} catch {
    Write-Host "⚠️  MinIO bucket initialization failed" -ForegroundColor $Colors.Yellow
}

# Display status
Write-Host "`n🎉 CDN Infrastructure Started Successfully!" -ForegroundColor $Colors.Green
Write-Host "`n📋 Service URLs:" -ForegroundColor $Colors.Blue
Write-Host "  • MinIO Console:  http://localhost:9001"
Write-Host "  • MinIO API:      http://localhost:9000"
Write-Host "  • CDN Proxy:      http://localhost:80"
Write-Host "  • Cache Status:   http://localhost:80/cache-status"

Write-Host "`n📊 Service Status:" -ForegroundColor $Colors.Blue
docker-compose ps

Write-Host "`n💾 Storage Info:" -ForegroundColor $Colors.Blue
Write-Host "  • MinIO Data:     $RootDir\data\minio"
Write-Host "  • Redis Data:     $RootDir\data\redis-cdn"
Write-Host "  • NGINX Cache:    $RootDir\data\nginx-cache"
Write-Host "  • NGINX Logs:     $RootDir\data\nginx-logs"

Write-Host "`n💡 Next Steps:" -ForegroundColor $Colors.Yellow
Write-Host "  1. Configure your application to use CDN_BASE_URL: http://localhost"
Write-Host "  2. Upload files will be accessible via: http://localhost/avatars/"
Write-Host "  3. Monitor logs: docker-compose logs -f"
Write-Host "  4. Stop CDN: .\scripts\stop-cdn.ps1"

Write-Host "`n✨ Ready for file uploads and CDN delivery!" -ForegroundColor $Colors.Green 