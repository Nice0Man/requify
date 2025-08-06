#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Скрипт для миграции v2 схем и обновления endpoints
.DESCRIPTION
    Переименовывает все _v2.py файлы в schemas/, обновляет __init__.py и исправляет импорты в endpoints
#>

param(
    [switch]$DryRun,
    [switch]$Backup = $true,
    [switch]$Force
)

$Colors = @{
    Success = "Green"
    Warning = "Yellow" 
    Error   = "Red"
    Info    = "Cyan"
    Header  = "Magenta"
}

function Write-ColorText {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Colors[$Color]
}

function Test-Prerequisites {
    Write-ColorText "🔍 Проверка предварительных условий..." -Color "Info"
    
    if (-not (Test-Path "backend/app/schemas")) {
        Write-ColorText "❌ Директория backend/app/schemas не найдена!" -Color "Error"
        exit 1
    }
    
    Write-ColorText "✅ Предварительные проверки пройдены" -Color "Success"
}

function Get-V2SchemaFiles {
    Write-ColorText "📋 Поиск файлов v2 схем..." -Color "Info"
    
    $v2Files = Get-ChildItem -Path "backend/app/schemas" -Filter "*_v2.py" | ForEach-Object {
        $baseName = $_.BaseName -replace "_v2$", ""
        $targetFile = Join-Path $_.Directory ($baseName + ".py")
        
        @{
            V2File     = $_.FullName
            TargetFile = $targetFile
            BaseName   = $baseName
            Exists     = Test-Path $targetFile
        }
    }
    
    if (-not $v2Files) {
        Write-ColorText "ℹ️  Файлы v2 схем не найдены" -Color "Info"
        return @()
    }
    
    Write-ColorText "📋 Найдено файлов v2: $($v2Files.Count)" -Color "Info"
    foreach ($file in $v2Files) {
        $status = if ($file.Exists) { "ПЕРЕЗАПИСЬ" } else { "НОВЫЙ" }
        Write-Host "  • $($file.BaseName).py [$status]" -ForegroundColor $Colors["Info"]
    }
    
    return $v2Files
}

function Backup-ExistingFiles {
    param([array]$V2Files)
    
    if (-not $Backup) {
        return
    }
    
    Write-ColorText "💾 Создание резервных копий..." -Color "Info"
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backend/app/schemas/backup_$timestamp"
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    foreach ($file in $V2Files) {
        if ($file.Exists) {
            $backupPath = Join-Path $backupDir (Split-Path $file.TargetFile -Leaf)
            Copy-Item $file.TargetFile $backupPath -Force
            Write-Host "  • Backup: $($file.BaseName).py → backup_$timestamp/" -ForegroundColor $Colors["Info"]
        }
    }
    
    Write-ColorText "✅ Резервные копии созданы в: $backupDir" -Color "Success"
}

function Rename-V2Files {
    param([array]$V2Files)
    
    Write-ColorText "🔄 Переименование v2 файлов..." -Color "Info"
    
    $results = @()
    
    foreach ($file in $V2Files) {
        try {
            if ($DryRun) {
                Write-Host "  [DRY-RUN] $($file.V2File) → $($file.TargetFile)" -ForegroundColor $Colors["Warning"]
                $results += @{ Success = $true; File = $file.BaseName; Action = "DRY-RUN" }
            }
            else {
                if ($file.Exists) {
                    Remove-Item $file.TargetFile -Force
                    Write-Host "  • Удален старый: $($file.BaseName).py" -ForegroundColor $Colors["Warning"]
                }
                
                Move-Item $file.V2File $file.TargetFile -Force
                Write-Host "  • Переименован: $($file.BaseName)_v2.py → $($file.BaseName).py" -ForegroundColor $Colors["Success"]
                $results += @{ Success = $true; File = $file.BaseName; Action = "RENAMED" }
            }
        }
        catch {
            Write-Host "  ❌ Ошибка при переименовании $($file.BaseName): $($_.Exception.Message)" -ForegroundColor $Colors["Error"]
            $results += @{ Success = $false; File = $file.BaseName; Error = $_.Exception.Message }
        }
    }
    
    return $results
}

function Update-InitFile {
    Write-ColorText "📝 Обновление __init__.py..." -Color "Info"
    
    $initPath = "backend/app/schemas/__init__.py"
    $updatedInitPath = "backend/app/schemas/__init___updated.py"
    
    if (-not (Test-Path $updatedInitPath)) {
        Write-ColorText "❌ Файл __init___updated.py не найден!" -Color "Error"
        return $false
    }
    
    try {
        if ($DryRun) {
            Write-Host "  [DRY-RUN] Будет заменен __init__.py" -ForegroundColor $Colors["Warning"]
            return $true
        }
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Copy-Item $initPath "backend/app/schemas/__init___backup_$timestamp.py" -Force
        
        Copy-Item $updatedInitPath $initPath -Force
        Write-Host "  ✅ __init__.py обновлен" -ForegroundColor $Colors["Success"]
        
        return $true
    }
    catch {
        Write-Host "  ❌ Ошибка при обновлении __init__.py: $($_.Exception.Message)" -ForegroundColor $Colors["Error"]
        return $false
    }
}

function Show-Summary {
    param([array]$Results, [bool]$InitUpdated)
    
    Write-ColorText "`n📊 СВОДКА ОПЕРАЦИЙ" -Color "Header"
    Write-ColorText "===================" -Color "Header"
    
    $successful = $Results | Where-Object { $_.Success }
    $failed = $Results | Where-Object { -not $_.Success }
    
    Write-Host "📁 Схемы:" -ForegroundColor $Colors["Info"]
    Write-Host "  • Успешно обработано: $($successful.Count)" -ForegroundColor $Colors["Success"]
    Write-Host "  • Ошибок: $($failed.Count)" -ForegroundColor $Colors["Error"]
    
    if ($successful) {
        Write-Host "  Обработанные файлы:" -ForegroundColor $Colors["Success"]
        foreach ($result in $successful) {
            Write-Host "    ✅ $($result.File) [$($result.Action)]" -ForegroundColor $Colors["Success"]
        }
    }
    
    if ($failed) {
        Write-Host "  Ошибки:" -ForegroundColor $Colors["Error"]
        foreach ($result in $failed) {
            Write-Host "    ❌ $($result.File): $($result.Error)" -ForegroundColor $Colors["Error"]
        }
    }
    
    Write-Host "`n📝 __init__.py:" -ForegroundColor $Colors["Info"]
    if ($InitUpdated) {
        Write-Host "  ✅ Успешно обновлен" -ForegroundColor $Colors["Success"]
    }
    else {
        Write-Host "  ❌ Не обновлен" -ForegroundColor $Colors["Error"]
    }
    
    if ($DryRun) {
        Write-ColorText "`n🧪 Это был пробный запуск. Никаких изменений не внесено." -Color "Warning"
        Write-ColorText "Для выполнения реальных изменений запустите без параметра -DryRun" -Color "Info"
    }
    else {
        Write-ColorText "`n🎉 Миграция завершена!" -Color "Success"
    }
    
    Write-ColorText "`n📋 Следующие шаги:" -Color "Info"
    Write-Host "1. Запустите .\scripts\fix_endpoints_imports.ps1 для исправления импортов" -ForegroundColor $Colors["Info"]
    Write-Host "2. Проверьте, что все тесты проходят" -ForegroundColor $Colors["Info"]
    Write-Host "3. Проверьте работу API endpoints" -ForegroundColor $Colors["Info"]
    Write-Host "4. Сделайте коммит изменений" -ForegroundColor $Colors["Info"]
}

# ==============================
# ОСНОВНАЯ ЛОГИКА
# ==============================

Write-ColorText "🚀 МИГРАЦИЯ V2 СХЕМ" -Color "Header"
Write-ColorText "=====================" -Color "Header"

if ($DryRun) {
    Write-ColorText "🧪 РЕЖИМ ПРОБНОГО ЗАПУСКА (DRY RUN)" -Color "Warning"
    Write-ColorText "Никаких изменений не будет внесено" -Color "Warning"
}

# Шаг 1: Предварительные проверки
Test-Prerequisites

# Шаг 2: Найти v2 файлы
$v2Files = Get-V2SchemaFiles
if (-not $v2Files) {
    Write-ColorText "✅ Нет файлов для миграции" -Color "Success"
    exit 0
}

# Шаг 3: Создать резервные копии
Backup-ExistingFiles -V2Files $v2Files

# Шаг 4: Переименовать файлы
$renameResults = Rename-V2Files -V2Files $v2Files

# Шаг 5: Обновить __init__.py
$initUpdated = Update-InitFile

# Шаг 6: Показать сводку
Show-Summary -Results $renameResults -InitUpdated $initUpdated

# Код завершения
$totalErrors = ($renameResults | Where-Object { -not $_.Success }).Count
if ($totalErrors -gt 0 -or -not $initUpdated) {
    exit 1
}
else {
    exit 0
}