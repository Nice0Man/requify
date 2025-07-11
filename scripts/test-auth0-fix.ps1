# Auth0 Configuration Fix Test Script
# Проверяет исправления конфигурации Auth0

Write-Host "===============================================" -ForegroundColor Green
Write-Host "      Тестирование исправлений Auth0" -ForegroundColor Green  
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# 1. Проверка статуса контейнеров
Write-Host "1. Проверка статуса контейнеров..." -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow

try {
    Set-Location "../deploy/docker"
    $containers = docker compose -f docker-compose.dev.yml ps --format table
    Write-Host $containers
    Write-Host ""
}
catch {
    Write-Host "❌ Ошибка при проверке контейнеров: $_" -ForegroundColor Red
}

# 2. Проверка Auth0 конфигурации бэкенда
Write-Host "2. Проверка Auth0 конфигурации бэкенда..." -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/oauth2/auth0/status" -Method Get -TimeoutSec 10
    Write-Host "✅ Auth0 Status:" -ForegroundColor Green
    Write-Host "   Enabled: $($response.enabled)" -ForegroundColor Cyan
    Write-Host "   Domain: $($response.domain)" -ForegroundColor Cyan  
    Write-Host "   Audience: $($response.audience)" -ForegroundColor Cyan
    Write-Host ""
    
    if ($response.enabled -eq $false) {
        Write-Host "✅ Правильно: Auth0 отключен в development режиме" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Внимание: Auth0 включен - проверьте конфигурацию" -ForegroundColor Yellow
    }
    Write-Host ""
}
catch {
    Write-Host "❌ Ошибка при проверке API: $_" -ForegroundColor Red
    Write-Host "   Убедитесь что бэкенд запущен на http://localhost:8000" -ForegroundColor Yellow
    Write-Host ""
}

# 3. Проверка фронтенда
Write-Host "3. Проверка фронтенда..." -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 10 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Фронтенд доступен на http://localhost:3000" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Фронтенд отвечает со статусом: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Фронтенд недоступен на http://localhost:3000" -ForegroundColor Red
    Write-Host "   Убедитесь что фронтенд запущен" -ForegroundColor Yellow
}
Write-Host ""

# 4. Проверка логов на ошибки Auth0
Write-Host "4. Проверка логов фронтенда на ошибки Auth0..." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

try {
    Set-Location "../deploy/docker"
    $logs = docker compose -f docker-compose.dev.yml logs frontend --tail=50 2>$null
    if ($logs) {
        $auth0Errors = $logs | Select-String -Pattern "auth0|authorize|404" -CaseSensitive:$false
        
        if ($auth0Errors.Count -eq 0) {
            Write-Host "✅ Нет ошибок Auth0 в логах фронтенда" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️ Найдены упоминания Auth0 в логах:" -ForegroundColor Yellow
            $auth0Errors | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        }
    }
    else {
        Write-Host "ℹ️ Логи фронтенда пусты" -ForegroundColor Blue
    }
}
catch {
    Write-Host "❌ Ошибка при проверке логов: $_" -ForegroundColor Red
}
Write-Host ""

# 5. Рекомендации
Write-Host "5. Рекомендации..." -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host "✅ Если все проверки прошли успешно:" -ForegroundColor Green
Write-Host "   - Откройте http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Попробуйте войти с admin@example.com / admin123" -ForegroundColor Cyan
Write-Host "   - Не должно быть ошибок 404 от auth0" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️ Если есть проблемы:" -ForegroundColor Yellow
Write-Host "   - Выполните: make restart-frontend" -ForegroundColor Cyan
Write-Host "   - Выполните: make restart-backend" -ForegroundColor Cyan
Write-Host "   - Проверьте: make auth0-status" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Для настройки реального Auth0:" -ForegroundColor Blue
Write-Host "   - Выполните: make auth0-setup" -ForegroundColor Cyan
Write-Host "   - Следуйте инструкциям в frontend/AUTH0_SETUP_INSTRUCTIONS.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "===============================================" -ForegroundColor Green
Write-Host "         Тестирование завершено!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Возвращаемся в исходную директорию
Set-Location "../../scripts" 