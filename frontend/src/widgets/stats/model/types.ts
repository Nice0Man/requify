import type { 
  DashboardMode, 
  DashboardLayout, 
  DashboardDensity,
  WidgetSize,
} from "@/shared/types/dashboard";

export type StatsWidgetVariant = "minimal" | "compact" | "detailed";
export type StatsPeriod = "1h" | "24h" | "7d" | "30d" | "90d";

/**
 * 📊 Dashboard Stats Widget Props
 * Optimized for performance and modern styling
 */
export interface DashboardStatsWidgetProps {
  /** Dashboard mode context */
  mode?: DashboardMode;
  
  /** Layout context */
  layout?: DashboardLayout;
  
  /** Density context */
  density?: DashboardDensity;
  
  /** Widget size */
  size?: WidgetSize;
  
  /** Display variant */
  variant?: StatsWidgetVariant;
  
  /** Show filter controls */
  showFilters?: boolean;
  
  /** Show export functionality */
  showExport?: boolean;
  
  /** Show refresh button */
  showRefresh?: boolean;
  
  /** Metric categories to display */
  category?: string[];
  
  /** Time period for data */
  period?: StatsPeriod;
  
  /** Metric click handler */
  onMetricClick?: (metric: any) => void;
  
  /** Additional CSS class */
  className?: string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: string | Error;
  
  /** Resize handler */
  onResize?: () => void;
  
  /** Collapse handler */
  onCollapse?: () => void;
  
  /** Compact mode for small displays */
  compact?: boolean;
  
  /** Show trend indicators */
  showTrends?: boolean;
  
  /** Maximum number of metrics to show */
  maxMetrics?: number;
  
  /** Enable animations */
  enableAnimations?: boolean;
  
  /** Virtualize long lists */
  virtualizeList?: boolean;
}
