# =============================================================================
# Start Requify Development Environment with Email Support (PowerShell)
# =============================================================================

Write-Host "🚀 Starting Requify Development Environment with Email Support" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ docker-compose is not installed. Please install it and try again." -ForegroundColor Red
    exit 1
}

# Navigate to the correct directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir
$DockerDir = Join-Path $ProjectRoot "deploy\docker"

Set-Location $DockerDir

Write-Host "📁 Working directory: $DockerDir" -ForegroundColor Cyan
Write-Host ""

# Check if development compose file exists
if (-not (Test-Path "docker-compose.dev.yml")) {
    Write-Host "❌ docker-compose.dev.yml not found in $DockerDir" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Starting services..." -ForegroundColor Yellow
Write-Host "This will start:" -ForegroundColor Yellow
Write-Host "  - PostgreSQL database" -ForegroundColor White
Write-Host "  - Redis cache" -ForegroundColor White
Write-Host "  - Backend API" -ForegroundColor White
Write-Host "  - Frontend" -ForegroundColor White
Write-Host "  - Nginx reverse proxy" -ForegroundColor White
Write-Host "  - MailHog email testing server" -ForegroundColor White
Write-Host "  - Adminer database management" -ForegroundColor White
Write-Host ""

# Start the services
docker-compose -f docker-compose.dev.yml up -d

Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep 10

# Check service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
Write-Host "=================="

$services = @(
    "requify-postgres-dev",
    "requify-redis-dev", 
    "requify-backend-dev",
    "requify-frontend-dev",
    "requify-nginx-dev",
    "requify_mailhog_dev",
    "requify_adminer_dev"
)

foreach ($service in $services) {
    $running = docker ps --format "table {{.Names}}" | Select-String $service
    if ($running) {
        Write-Host "✅ $service`: Running" -ForegroundColor Green
    } else {
        Write-Host "❌ $service`: Not running" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🌐 Service URLs:" -ForegroundColor Cyan
Write-Host "==============="
Write-Host "📱 Frontend:           http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Backend API:        http://localhost:8000" -ForegroundColor White
Write-Host "📖 API Documentation:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "📧 MailHog Web UI:     http://localhost:8025" -ForegroundColor White
Write-Host "🗄️  Adminer (DB):      http://localhost:8080" -ForegroundColor White
Write-Host "🔄 Nginx Proxy:        http://localhost:80" -ForegroundColor White
Write-Host ""

Write-Host "📧 Email Configuration:" -ForegroundColor Cyan
Write-Host "======================="
Write-Host "SMTP Server: mailhog:1025 (internal)" -ForegroundColor White
Write-Host "Web Interface: http://localhost:8025" -ForegroundColor White
Write-Host "All emails sent by the application will be captured by MailHog" -ForegroundColor White
Write-Host ""

Write-Host "🧪 Testing Email Setup:" -ForegroundColor Cyan
Write-Host "======================="
Write-Host "1. Register a new user or request password reset" -ForegroundColor White
Write-Host "2. Check MailHog web interface at http://localhost:8025" -ForegroundColor White
Write-Host "3. You should see the email in MailHog's inbox" -ForegroundColor White
Write-Host ""

Write-Host "🛑 To stop all services:" -ForegroundColor Yellow
Write-Host "docker-compose -f docker-compose.dev.yml down" -ForegroundColor White
Write-Host ""

Write-Host "📝 To view logs:" -ForegroundColor Yellow
Write-Host "docker-compose -f docker-compose.dev.yml logs -f [service-name]" -ForegroundColor White
Write-Host ""

Write-Host "✅ Development environment started successfully!" -ForegroundColor Green 