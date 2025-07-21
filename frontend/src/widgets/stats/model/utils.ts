import type { DashboardMode, DashboardDensity } from "@/shared/ui";
import type { StatsWidgetVariant } from "./types";

/**
 * Адаптирует variant виджета на основе режима дашборда
 */
export const adaptStatsVariantToMode = (
  mode: DashboardMode,
  variant?: StatsWidgetVariant
): StatsWidgetVariant => {
  if (variant) return variant;

  switch (mode) {
    case "minimal":
      return "minimal";
    case "compact":
      return "compact";
    case "detailed":
    case "fullscreen":
    default:
      return "detailed";
  }
};

/**
 * Определяет нужно ли показывать фильтры на основе density
 */
export const shouldShowStatsFilters = (
  density: DashboardDensity,
  showFilters: boolean
): boolean => {
  if (density === "dense") return false;
  return showFilters;
};

/**
 * Определяет нужно ли показывать экспорт на основе density и mode
 */
export const shouldShowStatsExport = (
  density: DashboardDensity,
  mode: DashboardMode,
  showExport: boolean
): boolean => {
  if (density === "dense" || mode === "minimal") return false;
  return showExport;
};
