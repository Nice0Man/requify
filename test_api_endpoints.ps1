# Comprehensive API Endpoint Testing Script
# Tests all API endpoint groups with admin@example.com / SecurePass123!

$baseUrl = "http://localhost:8000"
$adminEmail = "admin@example.com"
$adminPassword = "SecurePass123!"

Write-Host "=== REQUIFY API ENDPOINT TESTING ===" -ForegroundColor Cyan
Write-Host "Testing all endpoint groups..." -ForegroundColor Green

# Function to make API calls
function Invoke-ApiCall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = $null,
        [string]$ContentType = "application/json",
        [hashtable]$Headers = @{}
    )
    
    try {
        $uri = "$baseUrl$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = $ContentType
        }
        
        $response = Invoke-WebRequest @params
        Write-Host "✅ $Method $Endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ $Method $Endpoint - Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Test Basic Health Endpoints
Write-Host "`n=== 1. HEALTH ENDPOINTS ===" -ForegroundColor Yellow
Invoke-ApiCall -Method "GET" -Endpoint "/"
Invoke-ApiCall -Method "GET" -Endpoint "/health"
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/"
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/health"

# 2. Test Authentication Endpoints
Write-Host "`n=== 2. AUTHENTICATION ENDPOINTS ===" -ForegroundColor Yellow

# Try to register user first
$registerBody = @{
    email = $adminEmail
    password = $adminPassword
    confirm_password = $adminPassword
    username = "admin"
    full_name = "Admin User"
} | ConvertTo-Json

Write-Host "Attempting to register user..." -ForegroundColor Cyan
Invoke-ApiCall -Method "POST" -Endpoint "/api/v1/auth/register" -Body $registerBody

# Try to login
$loginBody = "username=$adminEmail&password=$adminPassword"
Write-Host "Attempting to login..." -ForegroundColor Cyan
$loginResponse = Invoke-ApiCall -Method "POST" -Endpoint "/api/v1/auth/login" -Body $loginBody -ContentType "application/x-www-form-urlencoded"

$token = $null
if ($loginResponse -and $loginResponse.StatusCode -eq 200) {
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.access_token
    Write-Host "✅ Login successful, token obtained" -ForegroundColor Green
} else {
    Write-Host "❌ Login failed, testing without authentication" -ForegroundColor Red
}

# Set headers for authenticated requests
$authHeaders = @{}
if ($token) {
    $authHeaders["Authorization"] = "Bearer $token"
}

# Test other auth endpoints
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/auth/me" -Headers $authHeaders

# 3. Test Identity Management Endpoints
Write-Host "`n=== 3. IDENTITY MANAGEMENT ENDPOINTS ===" -ForegroundColor Yellow
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/identity/users/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/identity/users/me" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/identity/roles/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/identity/permissions/" -Headers $authHeaders

# 4. Test Organization Endpoints
Write-Host "`n=== 4. ORGANIZATION ENDPOINTS ===" -ForegroundColor Yellow
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/organizations/companies/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/organizations/companies/my" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/organizations/teams/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/organizations/departments/" -Headers $authHeaders

# 5. Test Project Management Endpoints
Write-Host "`n=== 5. PROJECT MANAGEMENT ENDPOINTS ===" -ForegroundColor Yellow
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/projects/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/projects/requirements/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/projects/releases/" -Headers $authHeaders

# 6. Test Quality Assurance Endpoints
Write-Host "`n=== 6. QUALITY ASSURANCE ENDPOINTS ===" -ForegroundColor Yellow
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/quality/specifications/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/quality/testing/plans" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/quality/testing/cases" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/quality/reports/" -Headers $authHeaders

# 7. Test Collaboration Endpoints
Write-Host "`n=== 7. COLLABORATION ENDPOINTS ===" -ForegroundColor Yellow
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/collaboration/comments/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/collaboration/activity/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/collaboration/notifications/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/collaboration/relationships/" -Headers $authHeaders

# 8. Test Analytics Endpoints
Write-Host "`n=== 8. ANALYTICS ENDPOINTS ===" -ForegroundColor Yellow
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/analytics/dashboard/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/analytics/metrics/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/analytics/reports/" -Headers $authHeaders

# 9. Test System Administration Endpoints
Write-Host "`n=== 9. SYSTEM ADMINISTRATION ENDPOINTS ===" -ForegroundColor Yellow
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/system/health/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/system/admin/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/system/metrics/" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/system/audit/" -Headers $authHeaders

# 10. Test Configuration Endpoints
Write-Host "`n=== 10. CONFIGURATION ENDPOINTS ===" -ForegroundColor Yellow
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/configuration/reference/requirement-types" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/configuration/reference/requirement-priorities" -Headers $authHeaders
Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/configuration/settings/" -Headers $authHeaders

Write-Host "`n=== TESTING COMPLETE ===" -ForegroundColor Cyan
Write-Host "Check the results above for any failed endpoints" -ForegroundColor Green
