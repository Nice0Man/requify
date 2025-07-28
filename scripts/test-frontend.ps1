# Test Frontend Container Package Installation
# This script helps debug frontend package installation issues

$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"  
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
}

Write-Host "🧪 Testing Frontend Container Package Installation..." -ForegroundColor $Colors.Blue

# Navigate to deploy directory
Set-Location "$PSScriptRoot\..\deploy\docker"

# Check if frontend container is running
$frontendContainer = docker ps -q --filter "name=requify-frontend-dev"
if (-not $frontendContainer) {
    Write-Host "❌ Frontend container is not running. Starting it..." -ForegroundColor $Colors.Red
    docker-compose -f docker-compose.dev.yml up -d frontend
    Start-Sleep 30
    $frontendContainer = docker ps -q --filter "name=requify-frontend-dev"
}

if (-not $frontendContainer) {
    Write-Host "❌ Failed to start frontend container!" -ForegroundColor $Colors.Red
    exit 1
}

Write-Host "✅ Frontend container is running" -ForegroundColor $Colors.Green

# Test package installation
Write-Host "`n🔍 Checking package installation..." -ForegroundColor $Colors.Blue

Write-Host "📦 Checking node_modules directory..." -ForegroundColor $Colors.Yellow
try {
    $nodeModulesCheck = docker exec requify-frontend-dev ls -la /app/node_modules 2>$null
    if ($nodeModulesCheck) {
        Write-Host "✅ node_modules directory exists" -ForegroundColor $Colors.Green
        
        # Count packages
        $packageCount = docker exec requify-frontend-dev sh -c "ls /app/node_modules | wc -l" 2>$null
        Write-Host "📊 Package count: $packageCount" -ForegroundColor $Colors.Cyan
    } else {
        Write-Host "❌ node_modules directory is missing!" -ForegroundColor $Colors.Red
    }
} catch {
    Write-Host "❌ Failed to check node_modules" -ForegroundColor $Colors.Red
}

Write-Host "`n📋 Checking package.json..." -ForegroundColor $Colors.Yellow
try {
    $packageJsonCheck = docker exec requify-frontend-dev cat /app/package.json 2>$null
    if ($packageJsonCheck) {
        Write-Host "✅ package.json exists" -ForegroundColor $Colors.Green
    } else {
        Write-Host "❌ package.json is missing!" -ForegroundColor $Colors.Red
    }
} catch {
    Write-Host "❌ Failed to check package.json" -ForegroundColor $Colors.Red
}

Write-Host "`n🔧 Checking key dependencies..." -ForegroundColor $Colors.Yellow
$keyPackages = @("vite", "react", "react-dom", "@types/react")
foreach ($package in $keyPackages) {
    try {
        $packageCheck = docker exec requify-frontend-dev test -d "/app/node_modules/$package" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $package is installed" -ForegroundColor $Colors.Green
        } else {
            Write-Host "❌ $package is missing" -ForegroundColor $Colors.Red
        }
    } catch {
        Write-Host "❌ Failed to check $package" -ForegroundColor $Colors.Red
    }
}

Write-Host "`n🔄 Testing npm commands..." -ForegroundColor $Colors.Yellow
try {
    Write-Host "Testing npm --version..." -ForegroundColor $Colors.Cyan
    $npmVersion = docker exec requify-frontend-dev npm --version 2>$null
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor $Colors.Green
} catch {
    Write-Host "❌ npm command failed" -ForegroundColor $Colors.Red
}

try {
    Write-Host "Testing node --version..." -ForegroundColor $Colors.Cyan
    $nodeVersion = docker exec requify-frontend-dev node --version 2>$null
    Write-Host "✅ node version: $nodeVersion" -ForegroundColor $Colors.Green
} catch {
    Write-Host "❌ node command failed" -ForegroundColor $Colors.Red
}

Write-Host "`n🌐 Testing Vite dev server..." -ForegroundColor $Colors.Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible at http://localhost:3000" -ForegroundColor $Colors.Green
    }
} catch {
    Write-Host "❌ Frontend is not accessible at http://localhost:3000" -ForegroundColor $Colors.Red
    Write-Host "Checking container logs..." -ForegroundColor $Colors.Yellow
    docker logs requify-frontend-dev --tail 20
}

Write-Host "`n🔨 Troubleshooting Commands:" -ForegroundColor $Colors.Blue
Write-Host "View container logs:" -ForegroundColor $Colors.Cyan
Write-Host "  docker logs requify-frontend-dev -f"

Write-Host "Enter container shell:" -ForegroundColor $Colors.Cyan  
Write-Host "  docker exec -it requify-frontend-dev sh"

Write-Host "Manually install packages:" -ForegroundColor $Colors.Cyan
Write-Host "  docker exec requify-frontend-dev npm install"

Write-Host "Rebuild container:" -ForegroundColor $Colors.Cyan
Write-Host "  docker-compose -f docker-compose.dev.yml build --no-cache frontend"

Write-Host "Force restart frontend:" -ForegroundColor $Colors.Cyan
Write-Host "  docker-compose -f docker-compose.dev.yml restart frontend"

Write-Host "`n💡 If packages are missing, try:" -ForegroundColor $Colors.Yellow
Write-Host "1. Rebuild container: docker-compose -f docker-compose.dev.yml build --no-cache frontend"
Write-Host "2. Remove volumes: docker-compose -f docker-compose.dev.yml down -v"
Write-Host "3. Restart with CDN: ..\scripts\restart-with-cdn.ps1"

Write-Host "`n✅ Frontend package installation test completed!" -ForegroundColor $Colors.Green 