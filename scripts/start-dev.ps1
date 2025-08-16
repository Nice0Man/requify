# Requify Development Environment Startup Script
# This script starts the complete development environment with all services

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

Write-Host "🚀 Starting Requify Development Environment..." -ForegroundColor $Colors.Blue

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

# Create necessary data directories
Write-Host "📁 Creating data directories..." -ForegroundColor $Colors.Yellow
$DataDirs = @(
    "$RootDir\data\postgres",
    "$RootDir\data\postgres-test",
    "$RootDir\data\redis",
    "$RootDir\data\redis-cdn",
    "$RootDir\data\minio",
    "$RootDir\data\nginx-cache",
    "$RootDir\data\nginx-logs",
    "$RootDir\data\logs",
    "$RootDir\data\uploads",
    "$RootDir\data\static"
)

foreach ($Dir in $DataDirs) {
    if (-not (Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
        Write-Host "  ✅ Created: $Dir" -ForegroundColor $Colors.Green
    }
}

# Check for environment files
Write-Host "📋 Checking environment configuration..." -ForegroundColor $Colors.Yellow

$EnvFiles = @{
    "deploy\docker\.env" = "deploy\docker.env.example"
    "backend\.env" = "backend\env.example"
}

foreach ($envFile in $EnvFiles.Keys) {
    $envPath = Join-Path $RootDir $envFile
    $examplePath = Join-Path $RootDir $EnvFiles[$envFile]
    
    if (-not (Test-Path $envPath)) {
        if (Test-Path $examplePath) {
            Copy-Item $examplePath $envPath
            Write-Host "  ✅ Created: $envFile from example" -ForegroundColor $Colors.Green
        } else {
            Write-Host "  ⚠️  Missing: $envFile (and no example found)" -ForegroundColor $Colors.Yellow
        }
    } else {
        Write-Host "  ✅ Found: $envFile" -ForegroundColor $Colors.Green
    }
}

# Navigate to deploy directory
Set-Location "$RootDir\deploy\docker"

# Stop existing containers if running
Write-Host "🛑 Stopping existing containers..." -ForegroundColor $Colors.Yellow
try {
    docker-compose down 2>$null
} catch {
    # Ignore errors if containers aren't running
}

# Clean up old images if needed
Write-Host "🧹 Cleaning up old images..." -ForegroundColor $Colors.Yellow
try {
    docker system prune -f --volumes 2>$null | Out-Null
} catch {
    # Ignore cleanup errors
}

# Pull latest base images
Write-Host "📥 Pulling latest base images..." -ForegroundColor $Colors.Yellow
docker-compose pull postgres redis minio

# Build application images
Write-Host "🔨 Building application images..." -ForegroundColor $Colors.Yellow
docker-compose build --no-cache app frontend

# Start infrastructure services first
Write-Host "🔄 Starting infrastructure services..." -ForegroundColor $Colors.Yellow
docker-compose up -d postgres postgres-test redis minio redis-cdn

# Wait for infrastructure to be ready
Write-Host "⏳ Waiting for infrastructure services..." -ForegroundColor $Colors.Yellow

# Check PostgreSQL
Write-Host "🔍 Checking PostgreSQL..." -ForegroundColor $Colors.Blue
$timeout = 60
$counter = 0
while ($counter -lt $timeout) {
    try {
        $pgCheck = docker exec requify_postgres pg_isready -U postgres -d requify-db 2>$null
        if ($pgCheck -like "*accepting connections*") {
            Write-Host "  ✅ PostgreSQL is ready!" -ForegroundColor $Colors.Green
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep 2
    $counter += 2
}

# Check Redis
Write-Host "🔍 Checking Redis..." -ForegroundColor $Colors.Blue
try {
    $redisCheck = docker exec requify_redis redis-cli ping 2>$null
    if ($redisCheck -eq "PONG") {
        Write-Host "  ✅ Redis is ready!" -ForegroundColor $Colors.Green
    }
} catch {
    Write-Host "  ❌ Redis is not responding" -ForegroundColor $Colors.Red
}

# Check MinIO
Write-Host "🔍 Checking MinIO..." -ForegroundColor $Colors.Blue
$counter = 0
while ($counter -lt $timeout) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9000/minio/health/live" -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ MinIO is ready!" -ForegroundColor $Colors.Green
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep 2
    $counter += 2
}

# Initialize MinIO buckets
Write-Host "🪣 Initializing MinIO buckets..." -ForegroundColor $Colors.Yellow
try {
    docker-compose --profile init up mc
    Write-Host "  ✅ MinIO buckets initialized!" -ForegroundColor $Colors.Green
} catch {
    Write-Host "  ⚠️  MinIO bucket initialization failed" -ForegroundColor $Colors.Yellow
}

# Start application services
Write-Host "🚀 Starting application services..." -ForegroundColor $Colors.Yellow
docker-compose up -d app frontend nginx

# Wait for application services
Write-Host "⏳ Waiting for application services..." -ForegroundColor $Colors.Yellow

# Check Backend
Write-Host "🔍 Checking Backend API..." -ForegroundColor $Colors.Blue
$counter = 0
while ($counter -lt $timeout) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Backend API is ready!" -ForegroundColor $Colors.Green
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep 3
    $counter += 3
}

# Check Frontend
Write-Host "🔍 Checking Frontend..." -ForegroundColor $Colors.Blue
$counter = 0
while ($counter -lt $timeout) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Frontend is ready!" -ForegroundColor $Colors.Green
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep 3
    $counter += 3
}

# Check NGINX
Write-Host "🔍 Checking NGINX..." -ForegroundColor $Colors.Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost/cache-status" -TimeoutSec 2 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ NGINX is ready!" -ForegroundColor $Colors.Green
    }
} catch {
    Write-Host "  ⚠️  NGINX may not be fully ready" -ForegroundColor $Colors.Yellow
}

# Display final status
Write-Host "`n🎉 Development Environment Started Successfully!" -ForegroundColor $Colors.Green

Write-Host "`n📋 Service URLs:" -ForegroundColor $Colors.Blue
Write-Host "  • Frontend:       http://localhost:3000" -ForegroundColor $Colors.Green
Write-Host "  • Backend API:    http://localhost:8000" -ForegroundColor $Colors.Green
Write-Host "  • API Docs:       http://localhost:8000/docs" -ForegroundColor $Colors.Green
Write-Host "  • NGINX Proxy:    http://localhost:80" -ForegroundColor $Colors.Green
Write-Host "  • MinIO Console:  http://localhost:9001" -ForegroundColor $Colors.Green
Write-Host "  • MinIO API:      http://localhost:9000" -ForegroundColor $Colors.Green

Write-Host "`n📊 Service Status:" -ForegroundColor $Colors.Blue
docker-compose ps

Write-Host "`n💡 Development Tips:" -ForegroundColor $Colors.Yellow
Write-Host "  • Backend code: Hot reload enabled on .\backend\"
Write-Host "  • Frontend code: Hot reload enabled on .\frontend\"
Write-Host "  • Logs: docker-compose logs -f [service_name]"
Write-Host "  • Database: localhost:5432 (user: postgres, pass: postgres)"
Write-Host "  • Stop all: docker-compose down"

Write-Host "`n✨ Happy coding! 🎯" -ForegroundColor $Colors.Green 