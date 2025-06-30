#!/usr/bin/env pwsh
# Frontend Error Monitoring Script for Windows
# Usage: ./check-frontend-errors.ps1

# Frontend Error Checking Script for Windows PowerShell
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "          Frontend Error Check Report" -ForegroundColor Yellow  
Write-Host "===============================================" -ForegroundColor Yellow

# Test TypeScript compilation
Write-Host "`n1. Checking TypeScript compilation..." -ForegroundColor Cyan
Set-Location "../frontend"
npm run build > build-output.log 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed - see build-output.log" -ForegroundColor Red
}

# Test ESLint
Write-Host "`n2. Checking ESLint..." -ForegroundColor Cyan
npx eslint . --max-warnings 0 > lint-output.log 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No linting errors" -ForegroundColor Green
} else {
    Write-Host "⚠️  Linting issues found - see lint-output.log" -ForegroundColor Yellow
}

# Test runtime errors
Write-Host "`n3. Checking runtime errors..." -ForegroundColor Cyan
Set-Location "../deploy/docker"
$logs = docker compose -f docker-compose.dev.yml logs frontend 2>$null
if ($logs -match "error|failed|exception") {
    Write-Host "⚠️  Runtime errors detected" -ForegroundColor Yellow
} else {
    Write-Host "✅ No runtime errors found" -ForegroundColor Green
}

# Test npm audit
Write-Host "`n4. Checking security vulnerabilities..." -ForegroundColor Cyan
Set-Location "../../frontend"
npm audit --audit-level=moderate > audit-output.log 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No security vulnerabilities" -ForegroundColor Green
} else {
    Write-Host "⚠️  Security issues found - see audit-output.log" -ForegroundColor Yellow
}

Write-Host "`n===============================================" -ForegroundColor Yellow
Write-Host "Frontend error check completed!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Yellow

 