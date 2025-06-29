# Dashboard-Only Testing Script for Requify
Write-Host "=== Requify Dashboard Testing Script ===" -ForegroundColor Green

$baseUrl = "http://localhost:8000"
$headers = @{'Content-Type' = 'application/json'}

# Admin credentials
$adminCredentials = @{
    username = "admin@example.com"
    password = "SecurePass123!"
}

# Function to test endpoint
function Test-DashboardEndpoint {
    param(
        [string]$url,
        [string]$method = "GET",
        [string]$description,
        [hashtable]$headers = @{'Content-Type' = 'application/json'}
    )
    
    Write-Host "`n--- Testing: $description ---" -ForegroundColor Yellow
    Write-Host "URL: $method $url"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -ErrorAction Stop
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($response.Content) {
            try {
                $responseData = $response.Content | ConvertFrom-Json
                Write-Host "Response: $($responseData | ConvertTo-Json -Depth 2 -Compress)" -ForegroundColor Cyan
            } catch {
                $preview = $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
                Write-Host "Response: $preview" -ForegroundColor Cyan
            }
        }
        return $true
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode } else { "Unknown" }
        Write-Host "❌ Status: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
        
        # Try to get detailed error response
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorContent = $reader.ReadToEnd()
                if ($errorContent) {
                    Write-Host "Error Details: $errorContent" -ForegroundColor Red
                }
            } catch {
                Write-Host "Could not read error details" -ForegroundColor Red
            }
        }
        return $false
    }
}

# Get Admin Token
Write-Host "`n=== Getting Admin Authentication Token ===" -ForegroundColor Cyan

try {
    $loginBody = "username=$($adminCredentials.username)&password=$($adminCredentials.password)&grant_type=password"
    $loginHeaders = @{'Content-Type' = 'application/x-www-form-urlencoded'}
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/login" -Method "POST" -Headers $loginHeaders -Body $loginBody -ErrorAction Stop
    $loginJson = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    Write-Host "Token expires in: $($loginJson.expires_in) seconds" -ForegroundColor White
    
    $adminToken = $loginJson.access_token
} catch {
    Write-Host "❌ Failed to get admin token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$authHeaders = @{
    'Authorization' = "Bearer $adminToken"
    'Content-Type' = 'application/json'
}

# Test Health First
Write-Host "`n=== Basic Health Check ===" -ForegroundColor Cyan
Test-DashboardEndpoint -url "$baseUrl/health" -description "Backend Health Check"

# Test Core Dashboard Endpoints
Write-Host "`n=== Core Dashboard Endpoints ===" -ForegroundColor Cyan

Test-DashboardEndpoint -url "$baseUrl/api/v1/dashboard/my-dashboard" -description "🎯 My Dashboard (Main Target)" -headers $authHeaders
Test-DashboardEndpoint -url "$baseUrl/api/v1/dashboard/stats" -description "Dashboard Statistics" -headers $authHeaders  
Test-DashboardEndpoint -url "$baseUrl/api/v1/dashboard/activity" -description "Dashboard Activity" -headers $authHeaders
Test-DashboardEndpoint -url "$baseUrl/api/v1/dashboard/" -description "Dashboard Overview" -headers $authHeaders

# Test User Profile (to verify auth works)
Write-Host "`n=== Authentication Verification ===" -ForegroundColor Cyan
Test-DashboardEndpoint -url "$baseUrl/api/v1/users/me" -description "Current User Profile" -headers $authHeaders

# Test Projects (dependency for dashboard)
Write-Host "`n=== Project Dependencies ===" -ForegroundColor Cyan
Test-DashboardEndpoint -url "$baseUrl/api/v1/projects/" -description "User Projects" -headers $authHeaders

Write-Host "`n=== Dashboard Testing Complete ===" -ForegroundColor Green
Write-Host "🎯 Key Target: /api/v1/dashboard/my-dashboard" -ForegroundColor Yellow
Write-Host "Use this script for quick dashboard debugging!" -ForegroundColor White 