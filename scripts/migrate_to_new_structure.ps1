param(
    [switch]$DryRun,
    [switch]$Force
)

Write-Host "=== Requify Project Structure Migration ===" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be moved" -ForegroundColor Yellow
    Write-Host ""
}

# Get project root
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Write-Host "Project root: $ProjectRoot" -ForegroundColor Green
Write-Host ""

# Check if migration needed
$NeedsMigration = $false

if (Test-Path "$ProjectRoot\requify") {
    Write-Host "  - Found 'requify' folder" -ForegroundColor Yellow
    $NeedsMigration = $true
}

if (Test-Path "$ProjectRoot\requify.front") {
    Write-Host "  - Found 'requify.front' folder" -ForegroundColor Yellow
    $NeedsMigration = $true
}

if ((Test-Path "$ProjectRoot\Dockerfile") -or (Test-Path "$ProjectRoot\docker-compose.yml")) {
    Write-Host "  - Found Docker files in root" -ForegroundColor Yellow
    $NeedsMigration = $true
}

if (-not $NeedsMigration) {
    Write-Host "Project structure already migrated!" -ForegroundColor Green
    if (-not $Force) {
        Write-Host "Use -Force to proceed anyway." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""

if (-not $DryRun -and -not $Force) {
    $response = Read-Host "Proceed with migration? (y/N)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Migration cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Starting migration..." -ForegroundColor Green
Write-Host ""

# Create directories
Write-Host "Creating directories..." -ForegroundColor Blue

$Dirs = @(
    "backend", "frontend", "deploy", "deploy\docker", "deploy\docker\backend",
    "deploy\docker\frontend", "deploy\nginx", "deploy\env", "config", "docs",
    "data", "data\logs", "data\uploads", "data\backups", "data\static"
)

foreach ($dir in $Dirs) {
    $fullPath = "$ProjectRoot\$dir"
    if (-not (Test-Path $fullPath)) {
        if ($DryRun) {
            Write-Host "  [DRY] Would create: $dir" -ForegroundColor Cyan
        } else {
            Write-Host "  Creating: $dir" -ForegroundColor Green
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        }
    }
}

# Move main folders
Write-Host ""
Write-Host "Moving main folders..." -ForegroundColor Blue

if (Test-Path "$ProjectRoot\requify") {
    if ($DryRun) {
        Write-Host "  [DRY] Would move: requify -> backend" -ForegroundColor Cyan
    } else {
        Write-Host "  Moving: requify -> backend" -ForegroundColor Green
        Move-Item "$ProjectRoot\requify" "$ProjectRoot\backend" -Force
    }
}

if (Test-Path "$ProjectRoot\requify.front") {
    if ($DryRun) {
        Write-Host "  [DRY] Would move: requify.front -> frontend" -ForegroundColor Cyan
    } else {
        Write-Host "  Moving: requify.front -> frontend" -ForegroundColor Green
        Move-Item "$ProjectRoot\requify.front" "$ProjectRoot\frontend" -Force
    }
}

# Move data folders
Write-Host ""
Write-Host "Moving data folders..." -ForegroundColor Blue

$DataFolders = @("logs", "uploads", "backups", "static")
foreach ($folder in $DataFolders) {
    $sourcePath = "$ProjectRoot\$folder"
    if (Test-Path $sourcePath) {
        $targetPath = "$ProjectRoot\data\$folder"
        if ($DryRun) {
            Write-Host "  [DRY] Would move: $folder -> data\$folder" -ForegroundColor Cyan
        } else {
            Write-Host "  Moving: $folder -> data\$folder" -ForegroundColor Green
            Move-Item $sourcePath $targetPath -Force
        }
    }
}

# Move nginx
if (Test-Path "$ProjectRoot\nginx") {
    if ($DryRun) {
        Write-Host "  [DRY] Would move: nginx -> deploy\nginx" -ForegroundColor Cyan
    } else {
        Write-Host "  Moving: nginx -> deploy\nginx" -ForegroundColor Green
        Move-Item "$ProjectRoot\nginx" "$ProjectRoot\deploy\nginx" -Force
    }
}

# Move files
Write-Host ""
Write-Host "Moving configuration files..." -ForegroundColor Blue

$FileMoves = @{
    "Dockerfile" = "deploy\docker\Dockerfile"
    "Dockerfile.backend.dev" = "deploy\docker\backend\Dockerfile.dev"
    "Dockerfile.backend.prod" = "deploy\docker\backend\Dockerfile.prod"
    "Dockerfile.frontend.dev" = "deploy\docker\frontend\Dockerfile.dev"
    "Dockerfile.frontend.prod" = "deploy\docker\frontend\Dockerfile.prod"
    "docker-compose.yml" = "deploy\docker\docker-compose.yml"
    "docker-compose.dev.yml" = "deploy\docker\docker-compose.dev.yml"
    "docker-compose.prod.yml" = "deploy\docker\docker-compose.prod.yml"
    "nginx.conf" = "deploy\nginx\nginx.conf"
    "env.example" = "deploy\env\.env.example"
    "env.dev.example" = "deploy\env\.env.dev.example"
    "env.prod.example" = "deploy\env\.env.prod.example"
    "alembic.ini" = "config\alembic.ini"
    "redis.conf" = "config\redis.conf"
    "pytest.ini" = "config\pytest.ini"
    "pyproject.toml" = "config\pyproject.toml"
    "README.md" = "docs\README.md"
    "DOCKER_GUIDE.md" = "docs\DOCKER_GUIDE.md"
    "analysis_report_requify_tz.md" = "docs\analysis_report_requify_tz.md"
    "project_structure.md" = "docs\project_structure.md"
    "test_api_endpoints.ps1" = "scripts\test_api_endpoints.ps1"
}

foreach ($source in $FileMoves.Keys) {
    $sourcePath = "$ProjectRoot\$source"
    $targetPath = "$ProjectRoot\$($FileMoves[$source])"
    
    if (Test-Path $sourcePath) {
        $targetDir = Split-Path $targetPath -Parent
        if (-not (Test-Path $targetDir)) {
            if (-not $DryRun) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
        }
        
        if ($DryRun) {
            Write-Host "  [DRY] Would move: $source -> $($FileMoves[$source])" -ForegroundColor Cyan
        } else {
            Write-Host "  Moving: $source -> $($FileMoves[$source])" -ForegroundColor Green
            Move-Item $sourcePath $targetPath -Force
        }
    }
}

# Create .gitkeep files
Write-Host ""
Write-Host "Creating .gitkeep files..." -ForegroundColor Blue

$GitKeepDirs = @("data\logs", "data\uploads", "data\backups", "data\static", "deploy\nginx\ssl")

foreach ($dir in $GitKeepDirs) {
    $dirPath = "$ProjectRoot\$dir"
    $gitkeepPath = "$dirPath\.gitkeep"
    
    if (-not (Test-Path $dirPath)) {
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
        }
    }
    
    if (-not $DryRun) {
        if (-not (Test-Path $gitkeepPath)) {
            Write-Host "  Creating .gitkeep in: $dir" -ForegroundColor Green
            "" | Out-File -FilePath $gitkeepPath -Encoding UTF8
        }
    } else {
        Write-Host "  [DRY] Would create .gitkeep in: $dir" -ForegroundColor Cyan
    }
}

# Create root Makefile
Write-Host ""
Write-Host "Creating root Makefile..." -ForegroundColor Blue

if (-not $DryRun) {
    $MakefileContent = @"
# Makefile wrapper for new project structure
# This forwards all commands to scripts/Makefile

SCRIPT_DIR := `$(shell dirname `$(realpath `$(lastword `$(MAKEFILE_LIST))))

%:
	@`$(MAKE) -C `$(SCRIPT_DIR)/scripts `$@

.PHONY: help
help:
	@`$(MAKE) -C `$(SCRIPT_DIR)/scripts help
"@
    
    Write-Host "  Creating root Makefile wrapper" -ForegroundColor Green
    $MakefileContent | Out-File -FilePath "$ProjectRoot\Makefile" -Encoding UTF8
} else {
    Write-Host "  [DRY] Would create root Makefile wrapper" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Migration completed!" -ForegroundColor Green

if (-not $DryRun) {
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Review the new structure"
    Write-Host "2. Update IDE configurations"
    Write-Host "3. Test: make help"
    Write-Host "4. Commit changes"
    Write-Host ""
    Write-Host "Project reorganized successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Dry run completed. Run without -DryRun to migrate." -ForegroundColor Cyan
} 