# Simple DNS Configuration Script for Requify Platform
param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "status"
)

# Requify service domains
$RequifyDomains = @(
    "requify.local",
    "api.requify.local", 
    "cdn.requify.local",
    "admin.requify.local",
    "db.requify.local",
    "mail.requify.local",
    "docs.requify.local",
    "postgres.requify.local",
    "redis.requify.local",
    "frontend.requify.local"
)

function Write-Status {
    Write-Host ""
    Write-Host "=== Requify DNS Configuration Status ===" -ForegroundColor Yellow
    Write-Host ""
    
    # Check Docker containers
    Write-Host "Docker Containers:" -ForegroundColor Green
    try {
        docker ps --format "table {{.Names}}\t{{.Status}}" | Select-Object -Skip 1
    } catch {
        Write-Host "Docker not available" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Required DNS Domains:" -ForegroundColor Green
    foreach ($domain in $RequifyDomains) {
        Write-Host "  $domain" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Service Endpoints:" -ForegroundColor Green
    Write-Host "  Main App:     http://requify.local" -ForegroundColor Gray
    Write-Host "  Backend API:  http://api.requify.local" -ForegroundColor Gray
    Write-Host "  Frontend:     http://frontend.requify.local" -ForegroundColor Gray
    Write-Host "  CDN/Storage:  http://cdn.requify.local" -ForegroundColor Gray
    Write-Host "  Admin:        http://admin.requify.local" -ForegroundColor Gray
    Write-Host "  Database:     http://db.requify.local" -ForegroundColor Gray
    Write-Host "  Mail:         http://mail.requify.local" -ForegroundColor Gray
    Write-Host ""
}

function Test-Services {
    Write-Host "Testing Service Availability:" -ForegroundColor Green
    
    $testUrls = @{
        "Backend API" = "http://localhost:8000/health"
        "Frontend" = "http://localhost:3000"
        "MinIO API" = "http://localhost:9000/minio/health/live"
        "MinIO Console" = "http://localhost:9001"
        "Adminer" = "http://localhost:8080"
        "MailHog" = "http://localhost:8025"
    }
    
    foreach ($service in $testUrls.Keys) {
        $url = $testUrls[$service]
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -UseBasicParsing
            Write-Host "  $service`: Available (HTTP $($response.StatusCode))" -ForegroundColor Green
        } catch {
            Write-Host "  $service`: Unavailable" -ForegroundColor Red
        }
    }
    Write-Host ""
}

function Show-Help {
    Write-Host ""
    Write-Host "Requify DNS Setup Script" -ForegroundColor Yellow
    Write-Host "========================"
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Green
    Write-Host "  .\setup-dns.ps1 [ACTION]"
    Write-Host ""
    Write-Host "ACTIONS:" -ForegroundColor Green
    Write-Host "  status    Show current status (default)"
    Write-Host "  test      Test service availability"
    Write-Host "  help      Show this help"
    Write-Host ""
    Write-Host "MANUAL DNS SETUP:" -ForegroundColor Green
    Write-Host "  1. Run as Administrator:"
    Write-Host "     Add-Content C:\Windows\System32\drivers\etc\hosts '127.0.0.1 requify.local'"
    Write-Host "     Add-Content C:\Windows\System32\drivers\etc\hosts '127.0.0.1 api.requify.local'"
    Write-Host "     # ... repeat for other domains"
    Write-Host ""
    Write-Host "  2. Or use dnsmasq container (automatically configured)"
    Write-Host ""
}

# Main execution
Write-Host ""
Write-Host "Requify Platform DNS Setup" -ForegroundColor Magenta
Write-Host "==========================" -ForegroundColor Magenta

switch ($Action.ToLower()) {
    "status" { Write-Status }
    "test" { Test-Services }
    "help" { Show-Help }
    default { 
        Write-Host "Unknown action: $Action" -ForegroundColor Red
        Show-Help 
    }
}

Write-Host ""