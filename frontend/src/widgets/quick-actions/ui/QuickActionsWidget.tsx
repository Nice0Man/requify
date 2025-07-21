import { memo, useMemo } from "react";
import { DashboardWidgetWrapper } from "@/shared/ui";
import { QuickActionsWidget as FeatureQuickActionsWidget } from "@/features/dashboard";
import {
  type QuickActionsWidgetProps,
  quickActionsWidgetConfig,
  adaptQuickActionsVariantToMode,
  adaptQuickActionsMaxActions,
  shouldShowQuickActionsCategories,
  shouldShowQuickActionsShortcuts,
} from "../model";

/**
 * Quick Actions Widget с универсальным wrapper
 * Автоматически адаптируется под разные режимы дашборда
 */
export const QuickActionsWidget = memo<QuickActionsWidgetProps>(
  ({
    mode,
    layout,
    density,
    variant,
    maxActions = 8,
    showCategories = true,
    showShortcuts = true,
    showFavorites = true,
    category,
    onActionClick,
    className,
    loading = false,
    error,
    onResize,
    onCollapse,
  }) => {
    // Адаптируем настройки на основе dashboard mode и density
    const adaptedVariant = useMemo(
      () => adaptQuickActionsVariantToMode(mode, variant),
      [mode, variant]
    );

    const adaptedMaxActions = useMemo(
      () => adaptQuickActionsMaxActions(mode, density, layout, maxActions),
      [mode, density, layout, maxActions]
    );

    const adaptedShowCategories = useMemo(
      () => shouldShowQuickActionsCategories(mode, density, showCategories),
      [mode, density, showCategories]
    );

    const adaptedShowShortcuts = useMemo(
      () => shouldShowQuickActionsShortcuts(density, showShortcuts),
      [density, showShortcuts]
    );

    return (
      <DashboardWidgetWrapper
        config={quickActionsWidgetConfig}
        mode={mode}
        layout={layout}
        density={density}
        className={className}
        loading={loading}
        error={error}
        onResize={onResize}
        onCollapse={onCollapse}
        aria-label="Виджет быстрых действий"
      >
        <FeatureQuickActionsWidget
          {...({
            variant: adaptedVariant,
            maxActions: adaptedMaxActions,
            showCategories: adaptedShowCategories,
            showShortcuts: adaptedShowShortcuts,
            category,
            onActionClick,
          } as any)}
        />
      </DashboardWidgetWrapper>
    );
  }
);

QuickActionsWidget.displayName = "QuickActionsWidget";
