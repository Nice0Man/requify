import React, { memo, useMemo } from "react";
import { DashboardWidgetWrapper } from "@/shared/ui";
import {
  DashboardStatsWidget as FeatureDashboardStatsWidget,
} from "@/features/dashboard";
import {
  useRenderTracker,
  usePerformanceMeasure,
} from "@/shared/hooks/usePerformanceOptimizations";
import {
  type DashboardStatsWidgetProps,
  dashboardStatsWidgetConfig,
  adaptStatsVariantToMode,
  shouldShowStatsFilters,
  shouldShowStatsExport,
} from "../model";

/**
 * Dashboard Stats Widget с универсальным wrapper
 * Автоматически адаптируется под разные режимы дашборда
 */
export const DashboardStatsWidget = memo<DashboardStatsWidgetProps>(({
  mode,
  layout,
  density,
  variant,
  showFilters = true,
  showExport = true,
  showRefresh = true,
  category,
  period = "7d",
  onMetricClick,
  className,
  loading = false,
  error,
  onResize,
  onCollapse,
}) => {
  // Performance monitoring
  useRenderTracker("DashboardStatsWidget");
  usePerformanceMeasure("DashboardStatsWidget");

  // Адаптируем параметры на основе режима дашборда
  const adaptedVariant = useMemo(() => 
    adaptStatsVariantToMode(mode, variant), 
    [mode, variant]
  );

  const adaptedShowFilters = useMemo(() => 
    shouldShowStatsFilters(density, showFilters), 
    [density, showFilters]
  );

  const adaptedShowExport = useMemo(() => 
    shouldShowStatsExport(density, mode, showExport), 
    [density, mode, showExport]
  );

  return (
    <DashboardWidgetWrapper
      config={dashboardStatsWidgetConfig}
      mode={mode}
      layout={layout}
      density={density}
      className={className}
      loading={loading}
      error={error}
      onResize={onResize}
      onCollapse={onCollapse}
      aria-label="Виджет статистики дашборда"
    >
      <FeatureDashboardStatsWidget
        variant={adaptedVariant}
        showFilters={adaptedShowFilters}
        showExport={adaptedShowExport}
        showRefresh={showRefresh}
        category={category as any}
        period={period}
        onMetricClick={onMetricClick as any}
      />
    </DashboardWidgetWrapper>
  );
});

DashboardStatsWidget.displayName = "DashboardStatsWidget";
