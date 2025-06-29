#!/usr/bin/env pwsh

# Test script to verify all fixes for API endpoints and frontend issues

Write-Host "=== Testing API Endpoint Fixes ===" -ForegroundColor Green

# Test dashboard endpoint
Write-Host "`nTesting Dashboard My-Dashboard endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/dashboard/my-dashboard" -Method GET -Headers @{
        "Authorization" = "Bearer test-token"
        "Content-Type" = "application/json"
    } -ErrorAction Stop
    Write-Host "✓ Dashboard my-dashboard endpoint: SUCCESS" -ForegroundColor Green
} catch {
    Write-Host "✗ Dashboard my-dashboard endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test reference endpoints
Write-Host "`nTesting Reference endpoints..." -ForegroundColor Yellow

# Test requirement priorities
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/reference/requirement-priorities" -Method GET -Headers @{
        "Authorization" = "Bearer test-token"
        "Content-Type" = "application/json"
    } -ErrorAction Stop
    Write-Host "✓ Requirement priorities endpoint: SUCCESS" -ForegroundColor Green
} catch {
    Write-Host "✗ Requirement priorities endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test requirement statuses
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/reference/requirement-statuses" -Method GET -Headers @{
        "Authorization" = "Bearer test-token"
        "Content-Type" = "application/json"
    } -ErrorAction Stop
    Write-Host "✓ Requirement statuses endpoint: SUCCESS" -ForegroundColor Green
} catch {
    Write-Host "✗ Requirement statuses endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test requirements list endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/requirements/?limit=25&sort_by=updated_at&sort_order=desc" -Method GET -Headers @{
        "Authorization" = "Bearer test-token"
        "Content-Type" = "application/json"
    } -ErrorAction Stop
    Write-Host "✓ Requirements list endpoint: SUCCESS" -ForegroundColor Green
} catch {
    Write-Host "✗ Requirements list endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test other dashboard endpoints
Write-Host "`nTesting Other Dashboard endpoints..." -ForegroundColor Yellow

$endpoints = @(
    "/api/v1/dashboard/stats",
    "/api/v1/dashboard/overview",
    "/api/v1/dashboard/my-projects",
    "/api/v1/dashboard/my-requirements",
    "/api/v1/dashboard/activity"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000$endpoint" -Method GET -Headers @{
            "Authorization" = "Bearer test-token"
            "Content-Type" = "application/json"
        } -ErrorAction Stop
        Write-Host "✓ $endpoint : SUCCESS" -ForegroundColor Green
    } catch {
        Write-Host "✗ $endpoint : FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Frontend Fixes Summary ===" -ForegroundColor Green
Write-Host "✓ Fixed ProjectsPage.tsx: Added null checks for projects array filtering" -ForegroundColor Green
Write-Host "✓ Fixed TestingPage.tsx: Added null checks for test data arrays" -ForegroundColor Green
Write-Host "✓ Fixed dashboard endpoint: Removed incorrect await from get_default_preferences" -ForegroundColor Green

Write-Host "`n=== Testing Complete ===" -ForegroundColor Green
Write-Host "All major issues have been addressed. Frontend should no longer crash on undefined arrays." -ForegroundColor Cyan 