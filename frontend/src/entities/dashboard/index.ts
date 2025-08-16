// Dashboard Entity - FSD compliant exports

// Types
export type {
  // Core dashboard types
  DashboardMode,
  DashboardLayoutType,
  DashboardDensity,
  DashboardWidget,
  BaseWidgetProps,

  // Dashboard data types
  DashboardStats,
  DashboardMetric,
  DashboardPreferences,
  DashboardLayout,

  // Activity types
  ActivityResponse,
  ActivityFilters,

  // Action types (переехали в features/actions)
  // QuickAction,

  // System types
  SystemHealth,
  SystemService,
  DashboardSystemMetrics,

  // Chart data types
  ChartData,
  ChartDataset,
  TimelineDataPoint,
  DistributionDataPoint,

  // Filter types
  MetricsFilters,

  // Enum types
  WidgetType,
  WidgetSize,
  ActionCategory,
  NotificationType,
  DashboardView,

  // Helper types
  TrendData,
} from "./model/types";

// API
export { dashboardApi } from "./api/dashboardApi";

// Enum exports as values
export { MetricCategory, ActivityType } from "./model/types";

// Model exports (if needed)
export * from "./model";
