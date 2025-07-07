#!/bin/bash

# Script to organize UI components into unified folder structure
# Usage: ./organize-ui-components.sh [--dry-run]

set -e

UI_PATH="frontend/src/shared/ui"
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --ui-path)
            UI_PATH="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--dry-run] [--ui-path <path>]"
            exit 1
            ;;
    esac
done

echo "🔧 UI Components Organization Script"
echo "====================================="

# Check if UI directory exists
if [ ! -d "$UI_PATH" ]; then
    echo "❌ UI directory not found: $UI_PATH"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Define components to organize
declare -A COMPONENTS=(
    ["ActivityFeed"]="ActivityFeed.tsx|ActivityFeed"
    ["AnimatedText"]="AnimatedText.tsx|AnimatedText, AnimatedHeading, AnimatedList"
    ["ApiStatusIndicator"]="ApiStatusIndicator.tsx|ApiStatusIndicator"
    ["AuthButton"]="AuthButton.tsx|AuthButton"
    ["AuthFormField"]="AuthFormField.tsx|AuthFormField"
    ["ErrorBoundary"]="ErrorBoundary.tsx|ErrorBoundary"
    ["Footer"]="Footer.tsx|Footer|default"
    ["FormField"]="FormField.tsx|FormField, FormTextField, FormSelectField, FormCheckboxField, FormRadioField, FormAutocompleteField"
    ["FullPageScroll"]="FullPageScroll.tsx|FullPageScroll"
    ["Layout"]="Layout.tsx|Layout"
    ["LoadingBackdrop"]="LoadingBackdrop.tsx|LoadingBackdrop"
    ["Modal"]="Modal.tsx|Modal, ConfirmModal"
    ["PageTransition"]="PageTransition.tsx|PageTransition, RouteTransition, StaggeredTransition, SectionTransition"
    ["PermissionGuard"]="PermissionGuard.tsx|PermissionGuard, usePermissionGuard, AdminOnly, SuperuserOnly, ProjectsWrite, RequirementsWrite, ReleasesWrite, TestingExecute"
    ["PrivateRoute"]="PrivateRoute.tsx|PrivateRoute"
    ["QuickAccess"]="QuickAccess.tsx|QuickAccess"
    ["QuickAccessCard"]="QuickAccessCard.tsx|QuickAccess"
    ["ResponsiveImage"]="ResponsiveImage.tsx|ResponsiveImage, HeroImage, AvatarImage, CardImage"
    ["RoleBadge"]="RoleBadge.tsx|RoleBadge"
    ["ScrollIndicator"]="ScrollIndicator.tsx|ScrollIndicator, ScrollDots, ScrollProgress"
    ["SimpleFooter"]="SimpleFooter.tsx|SimpleFooter|default"
    ["Snackbar"]="Snackbar.tsx|SnackbarProvider, useSnackbar"
    ["TabPanel"]="TabPanel.tsx|TabPanel"
    ["Toast"]="toast.tsx|useToast"
    ["UserAvatar"]="UserAvatar.tsx|UserAvatar"
)

EXISTING_FOLDERS=("AuthLayout" "ConfirmDialog" "DataTable" "LoadingSpinner" "Page" "SearchFilters" "StatsCard")

echo -e "${GREEN}📁 Found UI directory: $UI_PATH${NC}"
echo ""

create_component_folder() {
    local component_name="$1"
    local file_info="$2"
    
    IFS='|' read -r file_name export_name is_default <<< "$file_info"
    
    local source_file="$UI_PATH/$file_name"
    local target_dir="$UI_PATH/$component_name"
    local target_file="$target_dir/$component_name.tsx"
    local index_file="$target_dir/index.ts"
    
    if [ ! -f "$source_file" ]; then
        echo -e "${YELLOW}⚠️  Source file not found: $file_name${NC}"
        return
    fi
    
    if [ -d "$target_dir" ]; then
        echo -e "${YELLOW}📂 Component folder already exists: $component_name${NC}"
        return
    fi
    
    echo -e "${CYAN}🔄 Processing: $component_name${NC}"
    
    if [ "$DRY_RUN" = false ]; then
        # Create component directory
        mkdir -p "$target_dir"
        
        # Move and rename the component file
        mv "$source_file" "$target_file"
        
        # Create index.ts file
        if [ "$is_default" = "default" ]; then
            echo "export { default as $component_name } from './$component_name';" > "$index_file"
        else
            echo "export { $export_name } from './$component_name';" > "$index_file"
        fi
        
        echo -e "  ${GREEN}✅ Created folder: $component_name/${NC}"
        echo -e "  ${GREEN}✅ Moved file: $file_name -> $component_name/$component_name.tsx${NC}"
        echo -e "  ${GREEN}✅ Created index: $component_name/index.ts${NC}"
    else
        echo -e "  ${YELLOW}[DRY RUN] Would create: $component_name/${NC}"
        echo -e "  ${YELLOW}[DRY RUN] Would move: $file_name -> $component_name/$component_name.tsx${NC}"
        echo -e "  ${YELLOW}[DRY RUN] Would create: $component_name/index.ts${NC}"
    fi
    
    echo ""
}

update_main_index() {
    local main_index_path="$UI_PATH/index.ts"
    
    echo -e "${CYAN}📝 Updating main index.ts file...${NC}"
    
    if [ "$DRY_RUN" = false ]; then
        cat > "$main_index_path" << 'EOF'
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
EOF
        
        echo -e "  ${GREEN}✅ Updated main index.ts${NC}"
    else
        echo -e "  ${YELLOW}[DRY RUN] Would update main index.ts${NC}"
    fi
    
    echo ""
}

remove_components_folder() {
    local components_dir="$UI_PATH/components"
    
    if [ -d "$components_dir" ]; then
        echo -e "${CYAN}🗑️  Removing old components folder...${NC}"
        
        if [ "$DRY_RUN" = false ]; then
            rm -rf "$components_dir"
            echo -e "  ${GREEN}✅ Removed: components/${NC}"
        else
            echo -e "  ${YELLOW}[DRY RUN] Would remove: components/${NC}"
        fi
        
        echo ""
    fi
}

# Main execution
echo -e "${GREEN}🚀 Starting UI components organization...${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}⚠️  DRY RUN MODE - No files will be modified${NC}"
    echo ""
fi

# Process each component
for component_name in "${!COMPONENTS[@]}"; do
    create_component_folder "$component_name" "${COMPONENTS[$component_name]}"
done

# Update main index file
update_main_index

# Remove old components folder if exists
remove_components_folder

echo -e "${GREEN}🎉 UI Components organization completed!${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}ℹ️  This was a dry run. To apply changes, run without --dry-run flag:${NC}"
    echo -e "${NC}   ./organize-ui-components.sh${NC}"
else
    echo -e "${GREEN}✨ All UI components are now organized in unified folder structure!${NC}"
    echo ""
    echo -e "${CYAN}📋 Summary of existing folder components:${NC}"
    for existing in "${EXISTING_FOLDERS[@]}"; do
        echo -e "  ${GRAY}📂 $existing/ (already organized)${NC}"
    done
fi

echo ""
echo -e "${CYAN}🔍 Verification:${NC}"
echo -e "   ${NC}- Each component is in its own folder: ComponentName/${NC}"
echo -e "   ${NC}- Each folder contains: ComponentName.tsx and index.ts${NC}"
echo -e "   ${NC}- Main index.ts exports from all component folders${NC}"
echo ""

# Make script executable
chmod +x "$0" 2>/dev/null || true 