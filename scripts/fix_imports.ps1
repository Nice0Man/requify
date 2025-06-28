# Fix import paths script
$backendPath = "backend"

# Get all Python files in the backend directory
$pythonFiles = Get-ChildItem -Path $backendPath -Recurse -Filter "*.py"

$totalFiles = $pythonFiles.Count
$processedFiles = 0
$modifiedFiles = 0

Write-Host "Found $totalFiles Python files to process..."

foreach ($file in $pythonFiles) {
    $processedFiles++
    $content = Get-Content $file.FullName -Raw
    
    $needsChanges = $false
    $newContent = $content
    
    # Check and fix "from requify.app." imports
    if ($content -match "from requify\.app\.") {
        $newContent = $newContent -replace "from requify\.app\.", "from app."
        $needsChanges = $true
    }
    
    # Check and fix "from requify.app import" imports
    if ($content -match "from requify\.app import") {
        $newContent = $newContent -replace "from requify\.app import", "from app import"
        $needsChanges = $true
    }
    
    if ($needsChanges) {
        Write-Host "[$processedFiles/$totalFiles] Fixing imports in: $($file.FullName)"
        
        # Write back to file
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $modifiedFiles++
    } else {
        Write-Host "[$processedFiles/$totalFiles] No changes needed: $($file.FullName)"
    }
}

Write-Host "`nCompleted! Modified $modifiedFiles out of $totalFiles files." 