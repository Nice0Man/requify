# Restart Requify Development Environment with CDN
# This script restarts the dev environment and ensures CDN services are running

$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"  
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
}

# Script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

Write-Host "🔄 Restarting Requify Development Environment with CDN..." -ForegroundColor $Colors.Blue

# Navigate to deploy directory
Set-Location "$RootDir\deploy\docker"

# Stop all services
Write-Host "🛑 Stopping all services..." -ForegroundColor $Colors.Yellow
docker-compose -f docker-compose.dev.yml down

# Clean up containers and networks
Write-Host "🧹 Cleaning up..." -ForegroundColor $Colors.Yellow
docker container prune -f | Out-Null
docker network prune -f | Out-Null

# Pull latest images
Write-Host "📥 Pulling latest images..." -ForegroundColor $Colors.Yellow  
docker-compose -f docker-compose.dev.yml pull

# Start infrastructure services first
Write-Host "🚀 Starting infrastructure services..." -ForegroundColor $Colors.Yellow
docker-compose -f docker-compose.dev.yml up -d postgres postgres-test redis minio redis-cdn mailhog

# Wait for infrastructure
Write-Host "⏳ Waiting for infrastructure..." -ForegroundColor $Colors.Cyan
Start-Sleep 15

# Initialize MinIO buckets
Write-Host "🪣 Initializing MinIO buckets..." -ForegroundColor $Colors.Yellow
try {
    docker-compose -f docker-compose.dev.yml --profile init up mc
    Write-Host "✅ MinIO buckets initialized!" -ForegroundColor $Colors.Green
} catch {
    Write-Host "⚠️ MinIO bucket initialization failed, continuing..." -ForegroundColor $Colors.Yellow
}

# Start application services
Write-Host "🚀 Starting application services..." -ForegroundColor $Colors.Yellow
docker-compose -f docker-compose.dev.yml up -d backend frontend nginx adminer

# Wait for application services
Write-Host "⏳ Waiting for application services..." -ForegroundColor $Colors.Cyan
Start-Sleep 20

# Check service health
Write-Host "🔍 Checking service health..." -ForegroundColor $Colors.Blue

$services = @{
    "PostgreSQL" = "docker exec requify-postgres-dev pg_isready -U requify_user -d requify_dev"
    "Redis" = "docker exec requify-redis-dev redis-cli ping"
    "MinIO" = "curl -s http://localhost:9000/minio/health/live"
    "Backend" = "curl -s http://localhost:8000/health"
    "Frontend" = "curl -s http://localhost:3000"
    "NGINX" = "curl -s http://localhost/cache-status"
}

foreach ($service in $services.Keys) {
    try {
        if ($service -eq "MinIO" -or $service -eq "Backend" -or $service -eq "Frontend" -or $service -eq "NGINX") {
            $response = Invoke-WebRequest -Uri ($services[$service] -replace "curl -s ", "") -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ $service is ready!" -ForegroundColor $Colors.Green
            }
        } else {
            $result = Invoke-Expression $services[$service] 2>$null
            if ($result -and ($result -eq "PONG" -or $result -like "*accepting connections*")) {
                Write-Host "  ✅ $service is ready!" -ForegroundColor $Colors.Green
            }
        }
    } catch {
        Write-Host "  ❌ $service is not ready" -ForegroundColor $Colors.Red
    }
}

# Display service status
Write-Host "`n📊 Service Status:" -ForegroundColor $Colors.Blue
docker-compose -f docker-compose.dev.yml ps

# Display service URLs
Write-Host "`n🌐 Development Services:" -ForegroundColor $Colors.Blue
Write-Host "  • Frontend:       http://localhost:3000" -ForegroundColor $Colors.Green
Write-Host "  • Backend API:    http://localhost:8000" -ForegroundColor $Colors.Green
Write-Host "  • API Docs:       http://localhost:8000/docs" -ForegroundColor $Colors.Green
Write-Host "  • NGINX Proxy:    http://localhost:80" -ForegroundColor $Colors.Green

Write-Host "`n📦 CDN Services:" -ForegroundColor $Colors.Cyan
Write-Host "  • MinIO Console:  http://localhost:9001 (admin/minioadmin123)" -ForegroundColor $Colors.Green
Write-Host "  • MinIO API:      http://localhost:9000" -ForegroundColor $Colors.Green
Write-Host "  • Cache Status:   http://localhost/cache-status" -ForegroundColor $Colors.Green
Write-Host "  • Avatars CDN:    http://localhost/avatars/" -ForegroundColor $Colors.Green
Write-Host "  • Uploads CDN:    http://localhost/cdn/uploads/" -ForegroundColor $Colors.Green
Write-Host "  • Documents CDN:  http://localhost/cdn/documents/" -ForegroundColor $Colors.Green

Write-Host "`n🛠️ Admin Tools:" -ForegroundColor $Colors.Yellow
Write-Host "  • Database Admin: http://localhost:8080" -ForegroundColor $Colors.Green
Write-Host "  • Mail Testing:   http://localhost:8025" -ForegroundColor $Colors.Green

Write-Host "`n💡 CDN Testing:" -ForegroundColor $Colors.Yellow
Write-Host "  • Test avatar upload via: POST http://localhost:8000/api/v1/users/me/avatar"
Write-Host "  • Check cache status: curl http://localhost/cache-status"
Write-Host "  • View MinIO buckets: http://localhost:9001"

Write-Host "`n🎉 Development environment with CDN is ready!" -ForegroundColor $Colors.Green
Write-Host "📝 Logs: docker-compose -f docker-compose.dev.yml logs -f [service]" -ForegroundColor $Colors.Cyan 