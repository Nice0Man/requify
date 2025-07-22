// React Query hooks
export * from "./useQueries";
export * from "./useQueryUtils";
export * from "./useTranslation";
export { useFullPageScroll } from "./useFullPageScroll";
export { useDebounced } from "./usePerformanceOptimizations";

// Dashboard sizing hooks
export { 
  useDashboardSizing, 
  useContainerSizing, 
  useCardSizing, 
  useChartSizing 
} from "./useDashboardSizing";
export type { DashboardSizes, DashboardSizingConfig } from "./useDashboardSizing";

// Dashboard widget hooks
export { 
  useDashboardWidgetSettings,
  type ComputedWidgetSettings
} from "./useDashboardWidgetSettings";

// Layout calculation hooks
export { 
  useLayoutCalculations,
  type LayoutDimensions,
  type UseLayoutCalculationsProps
} from "./useLayoutCalculations";