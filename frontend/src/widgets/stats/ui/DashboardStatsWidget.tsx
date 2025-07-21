import React, { memo } from "react";
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
import {
  useDashboardTheme,
  useDashboardPerformance,
  useAdaptiveSizing,
} from "@/shared";

/**
 * 📊 Modern Dashboard Stats Widget with unified styling
 * 
 * Features:
 * - Design tokens integration
 * - Performance optimized rendering
 * - Adaptive sizing and behavior
 * - Unified widget wrapper
 * - Minimal re-renders
 */
export const DashboardStatsWidget = memo<DashboardStatsWidgetProps>(({
  mode = "detailed",
  layout = "grid", 
  density = "comfortable",
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
  size = "medium",
  ...otherProps
}) => {
  // 🚀 Performance tracking
  useRenderTracker("DashboardStatsWidget");
  usePerformanceMeasure("DashboardStatsWidget");

    // 🎭 Theme and performance system
  const { mode: themeMode, density: themeDensity } = useDashboardTheme();
  const { isHighPerformanceMode } = useDashboardPerformance();
  
  // 📏 Adaptive sizing based on context
  const adaptiveSize = useAdaptiveSizing(
    mode || themeMode, 
    density || themeDensity, 
    size || "medium"
  );
  
  // 🔧 Адаптируем параметры на основе режима дашборда с мемоизацией
  const effectiveMode = mode || themeMode;
  const effectiveDensity = density || themeDensity;
  
  const adaptedVariant = React.useMemo(() => 
    adaptStatsVariantToMode(effectiveMode, variant), 
    [effectiveMode, variant]
  );

  const adaptedShowFilters = React.useMemo(() => 
    shouldShowStatsFilters(effectiveDensity, showFilters), 
    [effectiveDensity, showFilters]
  );

  const adaptedShowExport = React.useMemo(() => 
    shouldShowStatsExport(effectiveDensity, effectiveMode, showExport), 
    [effectiveDensity, effectiveMode, showExport]
  );
  
     // 🎯 Basic props for feature component
   const featureProps = React.useMemo(() => ({
     variant: adaptedVariant,
     showTrends: adaptiveSize !== "small",
     onMetricClick,
   }), [
     adaptedVariant,
     adaptiveSize,
     onMetricClick,
   ]);

  return (
    <DashboardWidgetWrapper
      config={dashboardStatsWidgetConfig}
      className={className}
      mode={effectiveMode}
      layout={layout}
      density={effectiveDensity}
      loading={loading}
      error={error}
      onResize={onResize}
      onCollapse={onCollapse}
             size={adaptiveSize as any}
      
    >
             <FeatureDashboardStatsWidget
         {...featureProps}
       />
    </DashboardWidgetWrapper>
  );
});

DashboardStatsWidget.displayName = "DashboardStatsWidget";
