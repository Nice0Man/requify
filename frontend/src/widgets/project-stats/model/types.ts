import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/ui";

export interface ProjectStatsWidgetProps {
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  className?: string;
  projectId?: string;
  showCharts?: boolean;
  showMetrics?: boolean;
  loading?: boolean;
  error?: string | Error;
} 