import type { DashboardMode, DashboardLayout, DashboardDensity } from "@/shared/types/dashboard";

export interface MetricCardData {
  id: string;
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label: string;
  };
  progress?: number;
  formatValue?: (value: number | string) => string;
  metadata?: {
    target?: number;
    unit?: string;
    description?: string;
  };
}

export interface EnhancedDashboardStatsWidgetProps {
  // Dashboard settings
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  
  // Feature-specific props
  variant?: "minimal" | "compact" | "detailed";
  showTrends?: boolean;
  onMetricClick?: (metricId: string) => void;
  masonry?: boolean;
  flexible?: boolean;
  maxHeight?: number;
  overflow?: string;
  
  // Wrapper props
  className?: string;
  loading?: boolean;
  error?: string | Error;
  onResize?: (size: { width: number; height: number }) => void;
  onCollapse?: (collapsed: boolean) => void;
}

export interface MetricCardProps {
  metric: MetricCardData;
  onMetricClick?: (metricId: string) => void;
  showTrends?: boolean;
  mode: DashboardMode;
  density: DashboardDensity;
  maxHeight?: number;
  overflow?: string;
}
