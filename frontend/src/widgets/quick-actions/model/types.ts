import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/ui";
import type { QuickAction, ActionCategory } from "@/entities/dashboard";

export interface QuickActionsWidgetProps {
  // Dashboard settings
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;

  // Feature-specific props
  variant?: "minimal" | "detailed" | "compact";
  maxActions?: number;
  showCategories?: boolean;
  showShortcuts?: boolean;
  showFavorites?: boolean;
  category?: ActionCategory;
  onActionClick?: (action: QuickAction) => void;

  // Wrapper props
  className?: string;
  loading?: boolean;
  error?: string | Error;
  onResize?: (size: { width: number; height: number }) => void;
  onCollapse?: (collapsed: boolean) => void;
}

export type QuickActionsVariant = "minimal" | "detailed" | "compact";
