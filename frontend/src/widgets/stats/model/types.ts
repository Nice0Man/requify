import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/ui";
import type {
  DashboardMetric,
  DashboardMetricCategory,
} from "@/features/dashboard";

export interface DashboardStatsWidgetProps {
  // Dashboard settings
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;

  // Feature-specific props
  variant?: "minimal" | "detailed" | "compact";
  showFilters?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  category?: DashboardMetricCategory[];
  period?: "1h" | "24h" | "7d" | "30d" | "90d";
  onMetricClick?: (metric: DashboardMetric) => void;

  // Wrapper props
  className?: string;
  loading?: boolean;
  error?: string | Error;
  onResize?: (size: { width: number; height: number }) => void;
  onCollapse?: (collapsed: boolean) => void;
}

export type StatsWidgetVariant = "minimal" | "detailed" | "compact";
export type StatsPeriod = "1h" | "24h" | "7d" | "30d" | "90d";
