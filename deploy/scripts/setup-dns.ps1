# Requify DNS Setup Script for Windows
# Automatic setup of local domains for Windows development

param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "cleanup", "test")]
    [string]$Action = "setup"
)

# Output functions with colors
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if running as Administrator
function Test-Administrator {
    $principal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Domains for configuration
$Domains = @(
    "requify.local",
    "api.requify.local",
    "cdn.requify.local", 
    "admin.requify.local",
    "docs.requify.local"
)

# Backup and update hosts file
function Set-HostsFile {
    $hostsPath = "$env:WINDIR\System32\drivers\etc\hosts"
    $backupPath = "$hostsPath.requify.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    
    try {
        # Create backup
        Copy-Item $hostsPath $backupPath -Force
        Write-Info "Backup created: $backupPath"
        
        # Read current hosts file
        $hostsContent = Get-Content $hostsPath
        
        # Remove existing Requify entries
        $cleanedContent = $hostsContent | Where-Object { 
            $_ -notmatch "requify\.local" -and $_ -notmatch "# Requify DNS" 
        }
        
        # Add new entries
        $newEntries = @()
        $newEntries += ""
        $newEntries += "# Requify DNS entries"
        foreach ($domain in $Domains) {
            $newEntries += "127.0.0.1 $domain"
        }
        
        # Combine and write
        $finalContent = $cleanedContent + $newEntries
        $finalContent | Out-File -FilePath $hostsPath -Encoding UTF8 -Force
        
        Write-Success "Hosts file updated successfully"
        return $true
    }
    catch {
        Write-Error "Failed to update hosts file: $($_.Exception.Message)"
        return $false
    }
}

# Remove Requify entries from hosts file
function Remove-HostsEntries {
    $hostsPath = "$env:WINDIR\System32\drivers\etc\hosts"
    
    try {
        # Read current hosts file
        $hostsContent = Get-Content $hostsPath
        
        # Remove Requify entries
        $cleanedContent = $hostsContent | Where-Object { 
            $_ -notmatch "requify\.local" -and $_ -notmatch "# Requify DNS" 
        }
        
        # Write cleaned content
        $cleanedContent | Out-File -FilePath $hostsPath -Encoding UTF8 -Force
        
        Write-Success "Requify DNS entries removed from hosts file"
        return $true
    }
    catch {
        Write-Error "Failed to clean hosts file: $($_.Exception.Message)"
        return $false
    }
}

# Flush DNS cache
function Clear-DnsCache {
    try {
        Write-Info "Flushing DNS cache..."
        $result = ipconfig /flushdns
        Write-Success "DNS cache flushed"
        return $true
    }
    catch {
        Write-Error "Failed to flush DNS cache: $($_.Exception.Message)"
        return $false
    }
}

# Test DNS resolution
function Test-DnsResolution {
    Write-Info "Testing DNS resolution..."
    
    $testPassed = $true
    
    foreach ($domain in $Domains) {
        Write-Info "Testing $domain..."
        
        try {
            $result = Resolve-DnsName -Name $domain -Type A -ErrorAction Stop
            if ($result.IPAddress -contains "127.0.0.1") {
                Write-Success "$domain OK"
            }
            else {
                Write-Warning "$domain resolves to $($result.IPAddress), expected 127.0.0.1"
                $testPassed = $false
            }
        }
        catch {
            Write-Error "$domain failed - $($_.Exception.Message)"
            $testPassed = $false
        }
    }
    
    if ($testPassed) {
        Write-Success "All domains configured correctly!"
    }
    else {
        Write-Warning "Some domains are not resolving. Please check configuration."
    }
    
    return $testPassed
}

# Show instructions
function Show-Instructions {
    Write-Info "=== USAGE INSTRUCTIONS ==="
    Write-Host ""
    Write-Host "1. Local domains configured:"
    foreach ($domain in $Domains) {
        Write-Host "   - http://$domain"
    }
    Write-Host ""
    Write-Host "2. Services available at:"
    Write-Host "   - Frontend:  http://requify.local"
    Write-Host "   - API:       http://api.requify.local"
    Write-Host "   - CDN:       http://cdn.requify.local"
    Write-Host "   - Admin:     http://admin.requify.local"
    Write-Host "   - Docs:      http://docs.requify.local"
    Write-Host ""
    Write-Host "3. Start development environment:"
    Write-Host "   cd ..\docker; make dev"
    Write-Host ""
    Write-Host "4. Testing (in PowerShell):"
    Write-Host "   Invoke-WebRequest -Uri http://requify.local/"
    Write-Host "   Invoke-WebRequest -Uri http://api.requify.local/"
    Write-Host "   Invoke-WebRequest -Uri http://cdn.requify.local/"
    Write-Host ""
    Write-Warning "IMPORTANT: Requires running Docker container with nginx!"
    Write-Host ""
    Write-Info "Additional commands:"
    Write-Host "   .\setup-dns.ps1 cleanup  - Clean DNS settings"
    Write-Host "   .\setup-dns.ps1 test     - Test DNS resolution"
}

# Check Docker availability
function Test-DockerAvailability {
    Write-Info "Checking Docker availability..."
    
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Write-Success "Docker found: $dockerVersion"
            return $true
        }
        else {
            Write-Warning "Docker not found or not running"
            Write-Info "Install Docker Desktop for Windows: https://www.docker.com/products/docker-desktop"
            return $false
        }
    }
    catch {
        Write-Warning "Docker not found or not running"
        Write-Info "Install Docker Desktop for Windows: https://www.docker.com/products/docker-desktop"
        return $false
    }
}

# Main function
function Main {
    Write-Info "Requify DNS Setup Script for Windows"
    Write-Info "===================================="
    
    # Check administrator privileges
    if (-not (Test-Administrator)) {
        Write-Error "Administrator privileges required!"
        Write-Info "Run PowerShell as administrator and retry the command."
        exit 1
    }
    
    # Execute based on action
    switch ($Action.ToLower()) {
        "setup" {
            Write-Info "Setting up Requify DNS configuration..."
            
            if (Set-HostsFile) {
                Clear-DnsCache
                Start-Sleep -Seconds 2
                Test-DnsResolution
                Show-Instructions
                Write-Success "DNS setup completed successfully!"
            }
            else {
                Write-Error "DNS setup failed!"
                exit 1
            }
        }
        
        "cleanup" {
            Write-Info "Cleaning up Requify DNS configuration..."
            
            if (Remove-HostsEntries) {
                Clear-DnsCache
                Write-Success "DNS cleanup completed!"
            }
            else {
                Write-Error "DNS cleanup failed!"
                exit 1
            }
        }
        
        "test" {
            Write-Info "Testing DNS resolution..."
            
            if (-not (Test-DnsResolution)) {
                Write-Error "DNS test failed!"
                exit 1
            }
        }
        
        default {
            Write-Error "Invalid action: $Action"
            Write-Info "Valid actions: setup, cleanup, test"
            exit 1
        }
    }
}

# Execute
Main