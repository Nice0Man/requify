# Rebuild Frontend Container
# This script completely rebuilds the frontend container from scratch to fix package issues

$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"  
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
}

Write-Host "🔨 Rebuilding Frontend Container..." -ForegroundColor $Colors.Blue

# Navigate to deploy directory
Set-Location "$PSScriptRoot\..\deploy\docker"

# Stop frontend container
Write-Host "🛑 Stopping frontend container..." -ForegroundColor $Colors.Yellow
docker-compose -f docker-compose.dev.yml stop frontend

# Remove frontend container and image
Write-Host "🗑️  Removing old container and image..." -ForegroundColor $Colors.Yellow
docker-compose -f docker-compose.dev.yml rm -f frontend

# Remove frontend image
try {
    $frontendImage = docker images -q "docker-frontend" 2>$null
    if ($frontendImage) {
        Write-Host "Removing old frontend image..." -ForegroundColor $Colors.Cyan
        docker rmi $frontendImage -f | Out-Null
    }
} catch {
    Write-Host "No old image to remove" -ForegroundColor $Colors.Cyan
}

# Remove anonymous volumes for clean start
Write-Host "🧹 Cleaning up volumes..." -ForegroundColor $Colors.Yellow
try {
    docker volume ls -q | Where-Object { $_ -like "*node_modules*" } | ForEach-Object {
        docker volume rm $_ -f 2>$null | Out-Null
    }
} catch {
    # Ignore volume cleanup errors
}

# Build frontend container with no cache
Write-Host "🔨 Building frontend container (no cache)..." -ForegroundColor $Colors.Blue
docker-compose -f docker-compose.dev.yml build --no-cache frontend

# Verify build success
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor $Colors.Red
    exit 1
}

Write-Host "✅ Frontend container built successfully!" -ForegroundColor $Colors.Green

# Start frontend container
Write-Host "🚀 Starting frontend container..." -ForegroundColor $Colors.Yellow
docker-compose -f docker-compose.dev.yml up -d frontend

# Wait for container to start
Write-Host "⏳ Waiting for container to start..." -ForegroundColor $Colors.Cyan
Start-Sleep 10

# Check if container is running
$frontendContainer = docker ps -q --filter "name=requify-frontend-dev"
if ($frontendContainer) {
    Write-Host "✅ Frontend container is running!" -ForegroundColor $Colors.Green
    
    # Monitor logs for a few seconds
    Write-Host "📋 Initial logs (will stop after 30 seconds):" -ForegroundColor $Colors.Cyan
    Start-Job {
        docker logs requify-frontend-dev -f 2>&1 | Select-Object -First 50
    } | Wait-Job -Timeout 30 | Receive-Job | ForEach-Object {
        Write-Host $_ -ForegroundColor $Colors.Cyan
    }
    
    # Test if packages are installed
    Write-Host "`n🔍 Checking package installation..." -ForegroundColor $Colors.Blue
    try {
        $nodeModules = docker exec requify-frontend-dev ls /app/node_modules 2>$null
        if ($nodeModules) {
            $packageCount = ($nodeModules | Measure-Object).Count
            Write-Host "✅ Found $packageCount packages in node_modules" -ForegroundColor $Colors.Green
        } else {
            Write-Host "⚠️  node_modules is empty or missing" -ForegroundColor $Colors.Yellow
        }
    } catch {
        Write-Host "❌ Could not check node_modules" -ForegroundColor $Colors.Red
    }
    
    # Test frontend access
    Write-Host "`n🌐 Testing frontend access..." -ForegroundColor $Colors.Blue
    Start-Sleep 20  # Give more time for Vite to start
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend is accessible at http://localhost:3000" -ForegroundColor $Colors.Green
        }
    } catch {
        Write-Host "⚠️  Frontend not yet accessible at http://localhost:3000" -ForegroundColor $Colors.Yellow
        Write-Host "This is normal for first startup. Check logs:" -ForegroundColor $Colors.Cyan
        Write-Host "  docker logs requify-frontend-dev -f" -ForegroundColor $Colors.Cyan
    }
    
} else {
    Write-Host "❌ Frontend container failed to start!" -ForegroundColor $Colors.Red
    Write-Host "Check logs: docker logs requify-frontend-dev" -ForegroundColor $Colors.Cyan
    exit 1
}

Write-Host "`n🎉 Frontend rebuild completed!" -ForegroundColor $Colors.Green
Write-Host "`n📝 Next steps:" -ForegroundColor $Colors.Blue
Write-Host "  • Check logs: docker logs requify-frontend-dev -f"
Write-Host "  • Test installation: .\scripts\test-frontend.ps1"  
Write-Host "  • Access frontend: http://localhost:3000"
Write-Host "  • Full restart: .\scripts\restart-with-cdn.ps1" 