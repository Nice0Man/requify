import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/ui";

export interface SystemHealthWidgetProps {
  // Dashboard settings
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;

  // Feature-specific props
  showMetrics?: boolean;
  showAlerts?: boolean;
  showStatus?: boolean;
  refreshInterval?: number;
  autoRefresh?: boolean;

  // Wrapper props
  className?: string;
  loading?: boolean;
  error?: string | Error;
  onResize?: (size: { width: number; height: number }) => void;
  onCollapse?: (collapsed: boolean) => void;
}

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend?: "up" | "down" | "stable";
} 