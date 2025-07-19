import { Box } from "@mui/material";

import {
  DashboardStatsWidget as FeatureDashboardStatsWidget,
  type DashboardMetric,
  type DashboardMetricCategory,
} from "@/features/dashboard";
import {
  useRenderTracker,
  usePerformanceMeasure,
} from "@/shared/hooks/usePerformanceOptimizations";
import { memo } from "react";

interface DashboardStatsWidgetProps {
  variant?: "minimal" | "detailed" | "compact";
  showFilters?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  category?: DashboardMetricCategory[];
  period?: "1h" | "24h" | "7d" | "30d" | "90d";
  onMetricClick?: (metric: DashboardMetric) => void;
  className?: string;
}

/**
 * Dashboard Stats Widget - обёртка над feature компонентом с мониторингом производительности
 * Предоставляет простой интерфейс для использования в страницах
 */
export const DashboardStatsWidget = memo<DashboardStatsWidgetProps>((props) => {
  // Performance monitoring
  useRenderTracker("DashboardStatsWidget");
  usePerformanceMeasure("DashboardStatsWidget");

  return (
    <Box
      sx={{
        border: "none",
        borderRadius: 0,
        boxShadow: "none",
        backgroundColor: "transparent",
      }}
    >
      <FeatureDashboardStatsWidget
        variant={props.variant}
        showFilters={props.showFilters}
        showExport={props.showExport}
        showRefresh={props.showRefresh}
        category={props.category as any}
        period={props.period}
        onMetricClick={props.onMetricClick as any}
        className={props.className}
      />
    </Box>
  );
});

DashboardStatsWidget.displayName = "DashboardStatsWidget";
