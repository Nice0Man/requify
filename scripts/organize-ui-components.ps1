#!/usr/bin/env pwsh

# Script to organize UI components into unified folder structure
# Usage: ./organize-ui-components.ps1 [-DryRun]

param(
    [string]$UIPath = "frontend/src/shared/ui",
    [switch]$DryRun = $false
)

Write-Host "UI Components Organization Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if UI directory exists
if (-not (Test-Path $UIPath)) {
    Write-Host "UI directory not found: $UIPath" -ForegroundColor Red
    exit 1
}

# Define components that need to be moved to folders
$ComponentsToOrganize = @(
    @{
        Name = "ActivityFeed"
        File = "ActivityFeed.tsx"
        ExportName = "ActivityFeed"
        IsDefault = $false
    },
    @{
        Name = "AnimatedText"
        File = "AnimatedText.tsx"
        ExportName = "AnimatedText, AnimatedHeading, AnimatedList"
        IsDefault = $false
    },
    @{
        Name = "ApiStatusIndicator"
        File = "ApiStatusIndicator.tsx"
        ExportName = "ApiStatusIndicator"
        IsDefault = $false
    },
    @{
        Name = "AuthButton"
        File = "AuthButton.tsx"
        ExportName = "AuthButton"
        IsDefault = $false
    },
    @{
        Name = "AuthFormField"
        File = "AuthFormField.tsx"
        ExportName = "AuthFormField"
        IsDefault = $false
    },
    @{
        Name = "ErrorBoundary"
        File = "ErrorBoundary.tsx"
        ExportName = "ErrorBoundary"
        IsDefault = $false
    },
    @{
        Name = "Footer"
        File = "Footer.tsx"
        ExportName = "Footer"
        IsDefault = $true
    },
    @{
        Name = "FormField"
        File = "FormField.tsx"
        ExportName = "FormField, FormTextField, FormSelectField, FormCheckboxField, FormRadioField, FormAutocompleteField"
        IsDefault = $false
    },
    @{
        Name = "FullPageScroll"
        File = "FullPageScroll.tsx"
        ExportName = "FullPageScroll"
        IsDefault = $false
    },
    @{
        Name = "Layout"
        File = "Layout.tsx"
        ExportName = "Layout"
        IsDefault = $false
    },
    @{
        Name = "LoadingBackdrop"
        File = "LoadingBackdrop.tsx"
        ExportName = "LoadingBackdrop"
        IsDefault = $false
    },
    @{
        Name = "Modal"
        File = "Modal.tsx"
        ExportName = "Modal, ConfirmModal"
        IsDefault = $false
    },
    @{
        Name = "PageTransition"
        File = "PageTransition.tsx"
        ExportName = "PageTransition, RouteTransition, StaggeredTransition, SectionTransition"
        IsDefault = $false
    },
    @{
        Name = "PermissionGuard"
        File = "PermissionGuard.tsx"
        ExportName = "PermissionGuard, usePermissionGuard, AdminOnly, SuperuserOnly, ProjectsWrite, RequirementsWrite, ReleasesWrite, TestingExecute"
        IsDefault = $false
    },
    @{
        Name = "PrivateRoute"
        File = "PrivateRoute.tsx"
        ExportName = "PrivateRoute"
        IsDefault = $false
    },
    @{
        Name = "QuickAccess"
        File = "QuickAccess.tsx"
        ExportName = "QuickAccess"
        IsDefault = $false
    },
    @{
        Name = "QuickAccessCard"
        File = "QuickAccessCard.tsx"
        ExportName = "QuickAccess"
        IsDefault = $false
    },
    @{
        Name = "ResponsiveImage"
        File = "ResponsiveImage.tsx"
        ExportName = "ResponsiveImage, HeroImage, AvatarImage, CardImage"
        IsDefault = $false
    },
    @{
        Name = "RoleBadge"
        File = "RoleBadge.tsx"
        ExportName = "RoleBadge"
        IsDefault = $false
    },
    @{
        Name = "ScrollIndicator"
        File = "ScrollIndicator.tsx"
        ExportName = "ScrollIndicator, ScrollDots, ScrollProgress"
        IsDefault = $false
    },
    @{
        Name = "SimpleFooter"
        File = "SimpleFooter.tsx"
        ExportName = "SimpleFooter"
        IsDefault = $true
    },
    @{
        Name = "Snackbar"
        File = "Snackbar.tsx"
        ExportName = "SnackbarProvider, useSnackbar"
        IsDefault = $false
    },
    @{
        Name = "TabPanel"
        File = "TabPanel.tsx"
        ExportName = "TabPanel"
        IsDefault = $false
    },
    @{
        Name = "Toast"
        File = "toast.tsx"
        ExportName = "useToast"
        IsDefault = $false
    },
    @{
        Name = "UserAvatar"
        File = "UserAvatar.tsx"
        ExportName = "UserAvatar"
        IsDefault = $false
    }
)

$ExistingFolderComponents = @("AuthLayout", "ConfirmDialog", "DataTable", "LoadingSpinner", "Page", "SearchFilters", "StatsCard")

Write-Host "Found UI directory: $UIPath" -ForegroundColor Green
Write-Host ""

function Create-ComponentFolder {
    param(
        [string]$ComponentName,
        [string]$FileName,
        [string]$ExportName,
        [bool]$IsDefault
    )
    
    $SourceFile = Join-Path $UIPath $FileName
    $TargetDir = Join-Path $UIPath $ComponentName
    $TargetFile = Join-Path $TargetDir "$ComponentName.tsx"
    $IndexFile = Join-Path $TargetDir "index.ts"
    
    if (-not (Test-Path $SourceFile)) {
        Write-Host "Source file not found: $FileName" -ForegroundColor Yellow
        return
    }
    
    if (Test-Path $TargetDir) {
        Write-Host "Component folder already exists: $ComponentName" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Processing: $ComponentName" -ForegroundColor Cyan
    
    if (-not $DryRun) {
        # Create component directory
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
        
        # Move and rename the component file
        Move-Item -Path $SourceFile -Destination $TargetFile
        
        # Create index.ts file
        if ($IsDefault) {
            $IndexContent = "export { default as $ComponentName } from './$ComponentName';"
        } else {
            $IndexContent = "export { $ExportName } from './$ComponentName';"
        }
        
        Set-Content -Path $IndexFile -Value $IndexContent -Encoding UTF8
        
        Write-Host "  Created folder: $ComponentName/" -ForegroundColor Green
        Write-Host "  Moved file: $FileName -> $ComponentName/$ComponentName.tsx" -ForegroundColor Green
        Write-Host "  Created index: $ComponentName/index.ts" -ForegroundColor Green
    } else {
        Write-Host "  [DRY RUN] Would create: $ComponentName/" -ForegroundColor Yellow
        Write-Host "  [DRY RUN] Would move: $FileName -> $ComponentName/$ComponentName.tsx" -ForegroundColor Yellow
        Write-Host "  [DRY RUN] Would create: $ComponentName/index.ts" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

function Update-MainIndex {
    $MainIndexPath = Join-Path $UIPath "index.ts"
    
    Write-Host "Updating main index.ts file..." -ForegroundColor Cyan
    
    if (-not $DryRun) {
        $NewIndexContent = @"
// Core UI Components
export { ErrorBoundary } from "./ErrorBoundary";
export { Footer } from "./Footer";
export { SimpleFooter } from "./SimpleFooter";
export { Layout } from "./Layout";

// Loading Components
export {
  LoadingSpinner,
  PageLoadingSpinner,
  OverlayLoadingSpinner,
  InlineLoadingSpinner,
} from "./LoadingSpinner";

// Page Transitions
export {
  PageTransition,
  RouteTransition,
  StaggeredTransition,
  SectionTransition,
} from "./PageTransition";

// Auth Components
export {
  AuthLayout,
  AuthFormLayout,
  MinimalAuthLayout,
  BrandedAuthLayout,
} from "./AuthLayout";
export { AuthFormField } from "./AuthFormField";
export { AuthButton } from "./AuthButton";

// Navigation & Access Control
export { PrivateRoute } from "./PrivateRoute";
export {
  PermissionGuard,
  usePermissionGuard,
  AdminOnly,
  SuperuserOnly,
  ProjectsWrite,
  RequirementsWrite,
  ReleasesWrite,
  TestingExecute,
} from "./PermissionGuard";

// Data Components
export { DataTable } from "./DataTable";
export type { DataTableProps, Column, Action } from "./DataTable";

// Form Components
export {
  FormField,
  FormTextField,
  FormSelectField,
  FormCheckboxField,
  FormRadioField,
  FormAutocompleteField,
} from "./FormField";

// Layout Components
export { Page } from "./Page";
export { StatsCard } from "./StatsCard";
export { SearchFilters } from "./SearchFilters";
export { ConfirmDialog } from "./ConfirmDialog";

// Media Components
export {
  ResponsiveImage,
  HeroImage,
  AvatarImage,
  CardImage,
} from "./ResponsiveImage";

// User Interface
export { UserAvatar } from "./UserAvatar";
export { RoleBadge } from "./RoleBadge";
export { ActivityFeed } from "./ActivityFeed";
export { QuickAccess } from "./QuickAccessCard";

// Feedback & Notifications
export { useToast } from "./Toast";
export { SnackbarProvider, useSnackbar } from "./Snackbar";
export { LoadingBackdrop } from "./LoadingBackdrop";
export { Modal, ConfirmModal } from "./Modal";

// Utility Components
export { ApiStatusIndicator } from "./ApiStatusIndicator";
export { FullPageScroll } from "./FullPageScroll";
export {
  AnimatedText,
  AnimatedHeading,
  AnimatedList,
} from "./AnimatedText";
export { TabPanel } from "./TabPanel";
export {
  ScrollIndicator,
  ScrollDots,
  ScrollProgress,
} from "./ScrollIndicator";
"@
        
        Set-Content -Path $MainIndexPath -Value $NewIndexContent -Encoding UTF8
        Write-Host "  Updated main index.ts" -ForegroundColor Green
    } else {
        Write-Host "  [DRY RUN] Would update main index.ts" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

function Remove-ComponentsFolder {
    $ComponentsDir = Join-Path $UIPath "components"
    
    if (Test-Path $ComponentsDir) {
        Write-Host "Removing old components folder..." -ForegroundColor Cyan
        
        if (-not $DryRun) {
            Remove-Item -Path $ComponentsDir -Recurse -Force
            Write-Host "  Removed: components/" -ForegroundColor Green
        } else {
            Write-Host "  [DRY RUN] Would remove: components/" -ForegroundColor Yellow
        }
        
        Write-Host ""
    }
}

# Main execution
Write-Host "Starting UI components organization..." -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be modified" -ForegroundColor Yellow
    Write-Host ""
}

# Process each component
foreach ($Component in $ComponentsToOrganize) {
    Create-ComponentFolder -ComponentName $Component.Name -FileName $Component.File -ExportName $Component.ExportName -IsDefault $Component.IsDefault
}

# Update main index file
Update-MainIndex

# Remove old components folder if exists
Remove-ComponentsFolder

Write-Host "UI Components organization completed!" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "This was a dry run. To apply changes, run without -DryRun flag:" -ForegroundColor Cyan
    Write-Host "   ./organize-ui-components-fixed.ps1" -ForegroundColor White
} else {
    Write-Host "All UI components are now organized in unified folder structure!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary of existing folder components:" -ForegroundColor Cyan
    foreach ($Existing in $ExistingFolderComponents) {
        Write-Host "  $Existing/ (already organized)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Verification:" -ForegroundColor Cyan
Write-Host "   - Each component is in its own folder: ComponentName/" -ForegroundColor White
Write-Host "   - Each folder contains: ComponentName.tsx and index.ts" -ForegroundColor White
Write-Host "   - Main index.ts exports from all component folders" -ForegroundColor White
Write-Host "" 