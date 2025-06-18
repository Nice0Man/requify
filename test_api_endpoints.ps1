#!/usr/bin/env pwsh

# API Endpoint Testing Script for Requify with Admin Credentials
Write-Host "=== Requify API Endpoint Testing with Admin Credentials ===" -ForegroundColor Green

$baseUrl = "http://localhost"
$headers = @{'Content-Type' = 'application/json'}

# Admin credentials - created by seed script
$adminCredentials = @{
    username = "admin@example.com"
    password = "SecurePass123!"
}

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$url,
        [string]$method = "GET",
        [string]$description,
        [hashtable]$body = $null,
        [hashtable]$headers = @{'Content-Type' = 'application/json'},
        [bool]$expectError = $false
    )
    
    Write-Host "`n--- Testing: $description ---" -ForegroundColor Yellow
    Write-Host "URL: $method $url"
    
    try {
        if ($body) {
            $jsonBody = $body | ConvertTo-Json -Depth 10
            $response = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -Body $jsonBody -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -ErrorAction Stop
        }
        
        Write-Host "Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
        
        if ($response.Content) {
            try {
                $jsonContent = $response.Content | ConvertFrom-Json
                if ($jsonContent -is [array] -and $jsonContent.Count -gt 3) {
                    Write-Host "Response: Array with $($jsonContent.Count) items"
                    Write-Host "First item: $($jsonContent[0] | ConvertTo-Json -Depth 2 -Compress)"
                } else {
                    Write-Host "Response: $($jsonContent | ConvertTo-Json -Depth 3 -Compress)"
                }
            } catch {
                $contentPreview = $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
                Write-Host "Response: $contentPreview"
            }
        }
        
        return $true
    } catch {
        $statusCode = "Unknown"
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
        }
        
        if ($expectError) {
            Write-Host "Status: $statusCode - Expected Error" -ForegroundColor Yellow
        } else {
            Write-Host "Status: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
        }
        
        if ($_.Exception.Response) {
            try {
                $errorContent = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorContent)
                $errorText = $reader.ReadToEnd()
                Write-Host "Error Response: $errorText"
            } catch {}
        }
        return $false
    }
}

# Function to get admin token
function Get-AdminToken {
    Write-Host "`n=== Getting Admin Authentication Token ===" -ForegroundColor Cyan
    
    try {
        # Using OAuth2 password flow
        $loginBody = "username=$($adminCredentials.username)&password=$($adminCredentials.password)&grant_type=password"
        $loginHeaders = @{'Content-Type' = 'application/x-www-form-urlencoded'}
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/login" -Method "POST" -Headers $loginHeaders -Body $loginBody -ErrorAction Stop
        $loginJson = $response.Content | ConvertFrom-Json
        
        Write-Host "✅ Admin login successful!" -ForegroundColor Green
        Write-Host "Token type: $($loginJson.token_type)"
        Write-Host "Expires in: $($loginJson.expires_in) seconds"
        
        return $loginJson.access_token
    } catch {
        Write-Host "❌ Failed to get admin token: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Basic Health Checks
Write-Host "`n=== Basic Health Checks ===" -ForegroundColor Cyan
Test-Endpoint -url "$baseUrl/health" -description "Health Check"
Test-Endpoint -url "$baseUrl/docs" -description "API Documentation"
Test-Endpoint -url "$baseUrl/openapi.json" -description "OpenAPI Schema"

# 2. Get Admin Token
$adminToken = Get-AdminToken
if (-not $adminToken) {
    Write-Host "❌ Cannot proceed without admin token!" -ForegroundColor Red
    exit 1
}

$authHeaders = @{
    'Authorization' = "Bearer $adminToken"
    'Content-Type' = 'application/json'
}

# 3. Test Authentication Endpoints
Write-Host "`n=== Authentication Endpoints ===" -ForegroundColor Cyan

# Test current user profile
Test-Endpoint -url "$baseUrl/api/v1/users/me" -description "Current Admin Profile" -headers $authHeaders

# Test token validation
$tokenValidationBody = @{ token = $adminToken }
Test-Endpoint -url "$baseUrl/api/v1/auth/validate-token" -method "POST" -description "Token Validation" -body $tokenValidationBody

# Test user sessions
Test-Endpoint -url "$baseUrl/api/v1/auth/sessions" -description "User Sessions" -headers $authHeaders

# 4. Admin-Only Endpoints
Write-Host "`n=== Admin-Only Endpoints ===" -ForegroundColor Cyan

Test-Endpoint -url "$baseUrl/api/v1/admin/users" -description "Admin: List All Users" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/admin/system-info" -description "Admin: System Information" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/admin/health" -description "Admin: Health Check" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/admin/metrics" -description "Admin: System Metrics" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/admin/users-stats" -description "Admin: User Statistics" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/admin/projects-stats" -description "Admin: Project Statistics" -headers $authHeaders

# 5. User Management Endpoints
Write-Host "`n=== User Management Endpoints ===" -ForegroundColor Cyan

Test-Endpoint -url "$baseUrl/api/v1/users/" -description "List Users" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/users/?limit=5" -description "List Users (Limited)" -headers $authHeaders

# Create a test user
$testUserData = @{
    username = "apitest_$(Get-Random)"
    email = "apitest_$(Get-Random)@example.com"
    password = "TestPassword123!"
    role = "viewer"
}

$createUserResult = Test-Endpoint -url "$baseUrl/api/v1/users/" -method "POST" -description "Create Test User" -body $testUserData -headers $authHeaders

# 6. Project Management Endpoints
Write-Host "`n=== Project Management Endpoints ===" -ForegroundColor Cyan

Test-Endpoint -url "$baseUrl/api/v1/projects/" -description "List Projects" -headers $authHeaders

# Create a test project
$testProjectData = @{
    name = "API Test Project $(Get-Random)"
    code = "ATP$(Get-Random)"
    description = "Project created during API testing"
    status = "active"
}

$createProjectResult = Test-Endpoint -url "$baseUrl/api/v1/projects/" -method "POST" -description "Create Test Project" -body $testProjectData -headers $authHeaders

# Get project stats
Test-Endpoint -url "$baseUrl/api/v1/projects/1/stats" -description "Project Stats" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/projects/1/requirements" -description "Project Requirements" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/projects/1/releases" -description "Project Releases" -headers $authHeaders

# 7. Requirements Management Endpoints
Write-Host "`n=== Requirements Management Endpoints ===" -ForegroundColor Cyan

Test-Endpoint -url "$baseUrl/api/v1/requirements/" -description "List Requirements" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/requirements/search?query=test" -description "Search Requirements" -headers $authHeaders

# 8. Releases Management Endpoints
Write-Host "`n=== Releases Management Endpoints ===" -ForegroundColor Cyan

Test-Endpoint -url "$baseUrl/api/v1/releases/" -description "List Releases" -headers $authHeaders

# 9. Testing Integration Endpoints
Write-Host "`n=== Testing Integration Endpoints ===" -ForegroundColor Cyan

Test-Endpoint -url "$baseUrl/api/v1/testing/results" -description "Test Results" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/testing/plans" -description "Test Plans" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/testing/cases" -description "Test Cases" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/testing/executions" -description "Test Executions" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/testing/reports/summary" -description "Testing Summary" -headers $authHeaders

# 10. Reference Data Endpoints
Write-Host "`n=== Reference Data Endpoints ===" -ForegroundColor Cyan

Test-Endpoint -url "$baseUrl/api/v1/reference/requirement-types" -description "Requirement Types" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/reference/requirement-statuses" -description "Requirement Statuses" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/reference/requirement-priorities" -description "Requirement Priorities" -headers $authHeaders
Test-Endpoint -url "$baseUrl/api/v1/reference/relationship-types" -description "Relationship Types" -headers $authHeaders

# Create reference data (admin only)
$testTypeData = @{
    code = "TEST_TYPE_$(Get-Random)"
    name = "Test Type"
    description = "Test requirement type created during API testing"
    is_active = $true
}

Test-Endpoint -url "$baseUrl/api/v1/reference/requirement-types" -method "POST" -description "Create Requirement Type" -body $testTypeData -headers $authHeaders

# 11. Test Authentication Failures (Without Token)
Write-Host "`n=== Testing Authentication Failures ===" -ForegroundColor Cyan

Test-Endpoint -url "$baseUrl/api/v1/users/" -description "List Users (No Auth)" -expectError $true
Test-Endpoint -url "$baseUrl/api/v1/admin/users" -description "Admin Users (No Auth)" -expectError $true
Test-Endpoint -url "$baseUrl/api/v1/projects/" -description "List Projects (No Auth)" -expectError $true

# 12. Test OAuth2PasswordBearer Integration
Write-Host "`n=== Testing OAuth2PasswordBearer Integration ===" -ForegroundColor Cyan

# Test with malformed token
$badAuthHeaders = @{
    'Authorization' = "Bearer invalid_token_12345"
    'Content-Type' = 'application/json'
}

Test-Endpoint -url "$baseUrl/api/v1/users/me" -description "Invalid Token Test" -headers $badAuthHeaders -expectError $true

# Test with missing Bearer prefix
$badAuthHeaders2 = @{
    'Authorization' = $adminToken
    'Content-Type' = 'application/json'
}

Test-Endpoint -url "$baseUrl/api/v1/users/me" -description "Malformed Auth Header" -headers $badAuthHeaders2 -expectError $true

Write-Host "`n=== API Testing Complete ===" -ForegroundColor Green
Write-Host "✅ All API routes tested with admin credentials!" -ForegroundColor Green 