# DNS Configuration Script for Requify Platform
param(
    [Parameter(Mandatory = $false)]
    [string]$Action = "help"
)

# Requify service domains
$RequifyServices = @{
    "requify.local"          = @{ Port = 80; Service = "nginx"; Description = "Main Application" }
    "api.requify.local"      = @{ Port = 8000; Service = "backend"; Description = "Backend API" }
    "cdn.requify.local"      = @{ Port = 9000; Service = "minio"; Description = "CDN Storage" }
    "admin.requify.local"    = @{ Port = 9001; Service = "minio"; Description = "MinIO Console" }
    "db.requify.local"       = @{ Port = 8080; Service = "adminer"; Description = "Database Admin" }
    "mail.requify.local"     = @{ Port = 8025; Service = "mailhog"; Description = "Mail Testing" }
    "docs.requify.local"     = @{ Port = 80; Service = "nginx"; Description = "Documentation" }
    "postgres.requify.local" = @{ Port = 5432; Service = "postgres"; Description = "PostgreSQL Database" }
    "redis.requify.local"    = @{ Port = 6379; Service = "redis"; Description = "Redis Cache" }
    "frontend.requify.local" = @{ Port = 3000; Service = "frontend"; Description = "Frontend Dev Server" }
}

function Write-ColoredText {
    param($Message, $Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-ServiceConnections {
    Write-ColoredText "Testing HTTP connections to Requify services..." "Cyan"
    Write-Host ""
    
    $httpServices = @{
        "http://localhost:8000/health"            = "Backend API Health"
        "http://localhost:3000"                   = "Frontend Dev Server"
        "http://localhost:9000/minio/health/live" = "MinIO Health"
        "http://localhost:9001"                   = "MinIO Console"
        "http://localhost:8080"                   = "Adminer"
        "http://localhost:8025"                   = "MailHog"
    }
    
    Write-ColoredText "Service Connection Test Results:" "Yellow"
    Write-Host ("=" * 90)
    
    foreach ($url in $httpServices.Keys | Sort-Object) {
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -UseBasicParsing
            $statusColor = "Green"
            $status = "Available"
            $statusCode = $response.StatusCode
        }
        catch {
            $statusColor = "Red"
            $status = "Unavailable"
            $statusCode = "Error"
        }
        
        $line = "{0,-45} {1,-15} {2}" -f $url, "[$statusCode]", $httpServices[$url]
        Write-ColoredText $line $statusColor
    }
    
    Write-Host ("=" * 90)
}

function Test-DnsResolution {
    Write-ColoredText "Testing DNS resolution for Requify domains..." "Cyan"
    Write-Host ""
    
    Write-ColoredText "DNS Resolution Test Results:" "Yellow"
    Write-Host ("=" * 80)
    
    $RequifyServices.Keys | Sort-Object | ForEach-Object {
        $domain = $_
        $service = $RequifyServices[$domain]
        
        try {
            $resolved = [System.Net.Dns]::GetHostAddresses($domain)
            if ($resolved.Count -gt 0) {
                $ip = $resolved[0].IPAddressToString
                $statusColor = "Green"
                $status = "Resolved"
            }
            else {
                $ip = "N/A"
                $statusColor = "Red"
                $status = "No resolution"
            }
        }
        catch {
            $ip = "N/A"
            $statusColor = "Red"
            $status = "Error"
        }
        
        $line = "{0,-25} {1,-15} {2,-10} {3}" -f $domain, $ip, "Port $($service.Port)", $service.Description
        Write-ColoredText $line $statusColor
    }
    
    Write-Host ("=" * 80)
}

function Show-CurrentStatus {
    Write-Host ""
    Write-ColoredText "=== Requify DNS Configuration Status ===" "Yellow"
    Write-Host ""
    
    # Check Docker containers
    Write-ColoredText "Checking Docker containers..." "Cyan"
    try {
        $containers = docker ps --format "table {{.Names}}\t{{.Status}}" 2>$null
        if ($containers) {
            Write-ColoredText "Running containers:" "Green"
            $containers | Select-Object -Skip 1 | ForEach-Object { 
                Write-ColoredText "  $_" "Gray" 
            }
        }
        else {
            Write-ColoredText "No Docker containers running" "Red"
        }
    }
    catch {
        Write-ColoredText "Docker not available or containers not running" "Red"
    }
    
    Write-Host ""
    
    # Show all available services
    Write-ColoredText "Available Requify services:" "Cyan"
    Write-Host ""
    Write-ColoredText ("{0,-25} {1,-10} {2,-20} {3}" -f "Domain", "Port", "Service", "Description") "Yellow"
    Write-Host ("-" * 80)
    
    $RequifyServices.Keys | Sort-Object | ForEach-Object {
        $domain = $_
        $service = $RequifyServices[$domain]
        $line = "{0,-25} {1,-10} {2,-20} {3}" -f $domain, $service.Port, $service.Service, $service.Description
        Write-ColoredText $line "Gray"
    }
    
    Write-Host ""
    Write-ColoredText "Quick Access URLs (if DNS configured):" "Cyan"
    Write-ColoredText "  Main App:     http://requify.local" "Cyan"
    Write-ColoredText "  Backend API:  http://api.requify.local/health" "Cyan"
    Write-ColoredText "  Frontend:     http://frontend.requify.local" "Cyan"
    Write-ColoredText "  Database:     http://db.requify.local" "Cyan"
    Write-ColoredText "  Mail Test:    http://mail.requify.local" "Cyan"
    Write-Host ""
    Write-ColoredText "Direct Access URLs (always work):" "Green"
    Write-ColoredText "  Backend API:  http://localhost:8000/health" "Green"
    Write-ColoredText "  Frontend:     http://localhost:3000" "Green"
    Write-ColoredText "  Database:     http://localhost:8080" "Green"
    Write-ColoredText "  Mail Test:    http://localhost:8025" "Green"
}

function Show-Help {
    Write-Host ""
    Write-ColoredText "Requify DNS Configuration Script" "Yellow"
    Write-ColoredText "================================" "Yellow"
    Write-Host ""
    Write-ColoredText "USAGE:" "Green"
    Write-Host "  .\configure-dns.ps1 [ACTION]"
    Write-Host ""
    Write-ColoredText "ACTIONS:" "Green"
    Write-Host "  status           Show current configuration status"
    Write-Host "  test             Test DNS resolution"
    Write-Host "  test-connections Test HTTP connections to services"
    Write-Host "  help             Show this help message"
    Write-Host ""
    Write-ColoredText "EXAMPLES:" "Green"
    Write-Host "  .\configure-dns.ps1 status              # Show current status"
    Write-Host "  .\configure-dns.ps1 test                # Test DNS resolution"
    Write-Host "  .\configure-dns.ps1 test-connections    # Test service connections"
    Write-Host ""
    Write-ColoredText "MANUAL DNS SETUP (Run as Administrator):" "Green"
    Write-Host "  Add-Content C:\Windows\System32\drivers\etc\hosts '127.0.0.1`trequify.local'"
    Write-Host "  Add-Content C:\Windows\System32\drivers\etc\hosts '127.0.0.1`tapi.requify.local'"
    Write-Host "  # ... repeat for other domains"
    Write-Host ""
    Write-ColoredText "DOMAINS CONFIGURED:" "Green"
    $RequifyServices.Keys | Sort-Object | ForEach-Object {
        Write-Host "  $_ -> $($RequifyServices[$_].Description)"
    }
    Write-Host ""
}

# Main execution
Write-Host ""
Write-ColoredText "Requify Platform DNS Configurator" "Magenta"
Write-ColoredText "=================================" "Magenta"
Write-Host ""

switch ($Action.ToLower()) {
    "status" {
        Show-CurrentStatus
    }
    
    "test" {
        Test-DnsResolution
    }
    
    "test-connections" {
        Test-ServiceConnections
    }
    
    "help" {
        Show-Help
    }
    
    default {
        Write-ColoredText "Unknown action: $Action" "Red"
        Write-ColoredText "Use 'help' action to see available options" "Cyan"
        Show-Help
        exit 1
    }
}

Write-Host ""
Write-ColoredText "DNS configuration script completed" "Cyan"
Write-Host ""