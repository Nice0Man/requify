import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/ui";
import type { QuickActionsVariant } from "./types";

/**
 * Адаптирует variant виджета на основе режима дашборда
 */
export const adaptQuickActionsVariantToMode = (
  mode: DashboardMode,
  variant?: QuickActionsVariant
): QuickActionsVariant => {
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
 * Адаптирует максимальное количество действий
 */
export const adaptQuickActionsMaxActions = (
  mode: DashboardMode,
  density: DashboardDensity,
  layout: DashboardLayout,
  maxActions: number
): number => {
  if (mode === "minimal") return Math.min(maxActions, 4);
  if (density === "dense") return Math.min(maxActions, 6);
  if (layout === "list") return Math.min(maxActions, 6);
  return maxActions;
};

/**
 * Определяет нужно ли показывать категории
 */
export const shouldShowQuickActionsCategories = (
  mode: DashboardMode,
  density: DashboardDensity,
  showCategories: boolean
): boolean => {
  if (mode === "minimal" || density === "dense") return false;
  return showCategories;
};

/**
 * Определяет нужно ли показывать шорткаты
 */
export const shouldShowQuickActionsShortcuts = (
  density: DashboardDensity,
  showShortcuts: boolean
): boolean => {
  if (density === "dense") return false;
  return showShortcuts;
};
