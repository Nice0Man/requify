#!/usr/bin/env pwsh
# Frontend Error Monitoring Script for Windows
# Usage: ./check-frontend-errors.ps1

param(
    [string]$Mode = "full"  # full, live, or health
)

Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "          Frontend Error Check Report" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host ""

function Test-Frontend-Build {
    Write-Host "1. Checking TypeScript compilation errors..." -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    
    Push-Location "../frontend"
    try {
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build successful" -ForegroundColor Green
        } else {
            Write-Host "❌ Build failed:" -ForegroundColor Red
            $buildOutput | Out-File -FilePath "build-output.log" -Encoding UTF8
            Write-Host $buildOutput -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
    Write-Host ""
}

function Test-Frontend-Lint {
    Write-Host "2. Checking ESLint errors and warnings..." -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    
    Push-Location "../frontend"
    try {
        $lintOutput = npm run lint 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ No linting errors" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Linting issues found:" -ForegroundColor Yellow
            $lintOutput | Out-File -FilePath "lint-output.log" -Encoding UTF8
            Write-Host $lintOutput -ForegroundColor Yellow
        }
    } finally {
        Pop-Location
    }
    Write-Host ""
}

function Test-Frontend-Runtime {
    Write-Host "3. Checking for runtime errors in logs..." -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    
    Push-Location "../deploy/docker"
    try {
        $logOutput = docker compose -f docker-compose.dev.yml logs frontend --tail=50 2>$null
        if ($logOutput) {
            $errors = $logOutput | Select-String -Pattern "(error|failed|exception|warning)" -CaseSensitive:$false
            if ($errors) {
                Write-Host "⚠️  Runtime errors detected:" -ForegroundColor Yellow
                $errors | Out-File -FilePath "../../frontend/runtime-errors.log" -Encoding UTF8
                $errors | ForEach-Object { Write-Host $_.Line -ForegroundColor Red }
            } else {
                Write-Host "✅ No runtime errors in recent logs" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️  Could not fetch container logs (container may not be running)" -ForegroundColor Yellow
        }
    } finally {
        Pop-Location
    }
    Write-Host ""
}

function Test-Frontend-Tests {
    Write-Host "4. Running frontend tests..." -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    
    Push-Location "../frontend"
    try {
        $testOutput = npm test -- --run --reporter=verbose 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ All tests passed" -ForegroundColor Green
        } else {
            Write-Host "❌ Test failures detected:" -ForegroundColor Red
            $testOutput | Out-File -FilePath "test-output.log" -Encoding UTF8
            Write-Host $testOutput -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
    Write-Host ""
}

function Test-Frontend-Security {
    Write-Host "5. Checking package vulnerabilities..." -ForegroundColor Cyan
    Write-Host "======================================" -ForegroundColor Cyan
    
    Push-Location "../frontend"
    try {
        $auditOutput = npm audit --audit-level=moderate 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ No security vulnerabilities" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Security vulnerabilities found:" -ForegroundColor Yellow
            $auditOutput | Out-File -FilePath "audit-output.log" -Encoding UTF8
            Write-Host $auditOutput -ForegroundColor Yellow
        }
    } finally {
        Pop-Location
    }
    Write-Host ""
}

function Test-Frontend-Bundle {
    Write-Host "6. Analyzing bundle size..." -ForegroundColor Cyan
    Write-Host "===========================" -ForegroundColor Cyan
    
    Push-Location "../frontend"
    try {
        npm run build >$null 2>&1
        if ($LASTEXITCODE -eq 0 -and (Test-Path "dist")) {
            $size = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
            $sizeFormatted = switch ($size) {
                {$_ -gt 1MB} { "{0:N2} MB" -f ($_ / 1MB) }
                {$_ -gt 1KB} { "{0:N2} KB" -f ($_ / 1KB) }
                default { "{0} bytes" -f $_ }
            }
            Write-Host "📦 Bundle size: $sizeFormatted" -ForegroundColor Blue
        } else {
            Write-Host "❌ Could not analyze bundle size" -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
    Write-Host ""
}

function Start-Frontend-Live-Monitor {
    Write-Host "Starting live frontend error monitoring..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Yellow
    
    Push-Location "../deploy/docker"
    try {
        docker compose -f docker-compose.dev.yml logs -f frontend | Select-String -Pattern "(error|failed|exception|warning)" -CaseSensitive:$false
    } finally {
        Pop-Location
    }
}

function Test-Frontend-Health {
    Write-Host "=== Frontend Health Check ===" -ForegroundColor Yellow
    
    # Check container status
    Push-Location "../deploy/docker"
    try {
        $containerStatus = docker compose -f docker-compose.dev.yml ps frontend --format "table {{.Status}}" 2>$null
        if ($containerStatus -and $containerStatus.Count -gt 1) {
            Write-Host "Frontend container status: $($containerStatus[1])" -ForegroundColor Blue
        } else {
            Write-Host "Frontend container status: Not running" -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
    
    # Check URL response
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "Frontend URL response: ✅ 200 OK" -ForegroundColor Green
        } else {
            Write-Host "Frontend URL response: ❌ Status: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Frontend URL response: ❌ Not responding" -ForegroundColor Red
    }
    
    # Check build status
    Push-Location "../frontend"
    try {
        npm run build >$null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Build status: ✅ Builds successfully" -ForegroundColor Green
        } else {
            Write-Host "Build status: ❌ Build fails" -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
    
    # Check recent errors
    Push-Location "../deploy/docker"
    try {
        $recentLogs = docker compose -f docker-compose.dev.yml logs frontend --tail=20 2>$null
        if ($recentLogs -and ($recentLogs | Select-String -Pattern "error" -CaseSensitive:$false)) {
            Write-Host "Recent errors: ⚠️  Errors detected" -ForegroundColor Yellow
        } else {
            Write-Host "Recent errors: ✅ No recent errors" -ForegroundColor Green
        }
    } finally {
        Pop-Location
    }
}

# Main execution
switch ($Mode.ToLower()) {
    "live" {
        Start-Frontend-Live-Monitor
    }
    "health" {
        Test-Frontend-Health
    }
    default {
        Test-Frontend-Build
        Test-Frontend-Lint
        Test-Frontend-Runtime
        Test-Frontend-Tests
        Test-Frontend-Security
        Test-Frontend-Bundle
        
        Write-Host "===============================================" -ForegroundColor Yellow
        Write-Host "Frontend error check completed!" -ForegroundColor Green
        Write-Host "Log files saved in frontend/ directory:" -ForegroundColor Blue
        Write-Host "  - build-output.log    (build errors)" -ForegroundColor Gray
        Write-Host "  - lint-output.log     (linting issues)" -ForegroundColor Gray
        Write-Host "  - runtime-errors.log  (runtime errors)" -ForegroundColor Gray
        Write-Host "  - test-output.log     (test results)" -ForegroundColor Gray
        Write-Host "  - audit-output.log    (security audit)" -ForegroundColor Gray
        Write-Host "===============================================" -ForegroundColor Yellow
    }
} 