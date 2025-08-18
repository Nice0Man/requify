import type {
  DashboardMode,
  DashboardLayoutType,
  DashboardDensity,
} from "@/widgets/types";

// Define DashboardWidget interface locally since it's not available from entities
interface DashboardWidget {
  id: string;
  component: React.ComponentType<any>;
  priority: number;
  size: "small" | "medium" | "large";
  props: Record<string, any>;
  gridSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  visible: {
    [K in DashboardMode]: boolean;
  };
}

// Widget Components
import { QuickActionsWidget } from "@/widgets/quick-actions";
import { ProjectOverviewWidget } from "@/widgets/project-overview";
import { ProjectStatsWidget } from "@/widgets/project-stats";
import { SystemHealthWidget } from "@/widgets/system-health";
import { ActivityFeedWidget } from "@/widgets/activity-feed";
import { RequirementListWidget } from "@/widgets/requirement-list";
import { KanbanWidget } from "@/widgets/kanban";

// Unified Dashboard Stats Widget (FSD compliant)
import { DashboardStatsWidget } from "@/widgets/dashboard-stats";

/**
 * Создание конфигурации виджетов для дашборда
 * Использует все доступные виджеты с интеграцией entities
 */
export const createDashboardWidgets = (
  overview: any,
  timelineData: any[],
  distributionData: any[]
): DashboardWidget[] => {
  const widgets: DashboardWidget[] = [
    // 1. Ключевые метрики - Наивысший приоритет
    {
      id: "key-metrics",
      component: DashboardStatsWidget,
      priority: 1,
      size: "large",
      props: {
        customTitle: "Ключевые метрики",
        showSettings: true,
        showExport: true,
        displayConfig: {
          variant: "detailed",
          showTrends: true,
          showProgress: true,
          columns: 3,
          maxMetrics: 6,
          compact: false,
        },
      },
      gridSize: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 8,
        xl: 8,
      },
      visible: {
        minimal: true,
        compact: true,
        detailed: true,
        fullscreen: true,
        overview: true,
      },
    },

    // 2. Быстрые действия - Высокий приоритет
    {
      id: "quick-actions",
      component: QuickActionsWidget,
      priority: 2,
      size: "medium",
      props: {
        variant: "detailed",
        showRefresh: true,
        showSettings: true,
        mode: "detailed",
        density: "comfortable",
        layout: "grid",
      },
      gridSize: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 4,
        xl: 4,
      },
      visible: {
        minimal: false,
        compact: true,
        detailed: true,
        fullscreen: true,
        overview: true,
      },
    },

    // 3. Состояние системы - Высокий приоритет
    {
      id: "system-health",
      component: SystemHealthWidget,
      priority: 3,
      size: "medium",
      props: {
        variant: "detailed",
        showRefresh: true,
        autoRefresh: true,
        refreshInterval: 30000,
        mode: "detailed",
        density: "comfortable",
        layout: "grid",
      },
      gridSize: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 4,
        xl: 4,
      },
      visible: {
        minimal: false,
        compact: false,
        detailed: true,
        fullscreen: true,
        overview: true,
      },
    },

    // 4. Статистика проектов - Средний приоритет
    {
      id: "project-stats",
      component: ProjectStatsWidget,
      priority: 4,
      size: "medium",
      props: {
        variant: "detailed",
        showTrends: true,
        mode: "detailed",
        density: "comfortable",
        layout: "grid",
      },
      gridSize: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 6,
        xl: 6,
      },
      visible: {
        minimal: false,
        compact: true,
        detailed: true,
        fullscreen: true,
        overview: true,
      },
    },

    // 5. Обзор проектов - Средний приоритет
    {
      id: "project-overview",
      component: ProjectOverviewWidget,
      priority: 5,
      size: "large",
      props: {
        variant: "detailed",
        showProjectDetails: true,
        maxProjects: 5,
        mode: "detailed",
        density: "comfortable",
        layout: "grid",
      },
      gridSize: {
        xs: 12,
        sm: 12,
        md: 8,
        lg: 6,
        xl: 6,
      },
      visible: {
        minimal: false,
        compact: true,
        detailed: true,
        fullscreen: true,
        overview: true,
      },
    },

    // 6. Канбан доска - Средний приоритет
    {
      id: "kanban-board",
      component: KanbanWidget,
      priority: 6,
      size: "large",
      props: {
        variant: "compact",
        maxColumns: 4,
        maxCards: 3,
        mode: "detailed",
        density: "comfortable",
        layout: "grid",
      },
      gridSize: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 8,
        xl: 8,
      },
      visible: {
        minimal: false,
        compact: false,
        detailed: true,
        fullscreen: true,
        overview: true,
      },
    },

    // 7. Лента активности - Средний приоритет
    {
      id: "activity-feed",
      component: ActivityFeedWidget,
      priority: 7,
      size: "medium",
      props: {
        variant: "compact",
        maxItems: 10,
        showUserActions: true,
        mode: "detailed",
        density: "comfortable",
        layout: "grid",
      },
      gridSize: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 4,
        xl: 4,
      },
      visible: {
        minimal: false,
        compact: false,
        detailed: true,
        fullscreen: true,
        overview: true,
      },
    },

    // 8. Список требований - Низкий приоритет
    {
      id: "requirement-list",
      component: RequirementListWidget,
      priority: 8,
      size: "large",
      props: {
        variant: "compact",
        maxRequirements: 8,
        showFilters: false,
        mode: "detailed",
        density: "comfortable",
        layout: "grid",
      },
      gridSize: {
        xs: 12,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 8,
      },
      visible: {
        minimal: false,
        compact: false,
        detailed: true,
        fullscreen: true,
        overview: true,
      },
    },

    // 9. Управление графиками - Низкий приоритет
    {
      id: "charts-management",
      component: QuickActionsWidget, // Assuming ChartsManagementWidget is no longer available or replaced
      priority: 9,
      size: "large",
      props: {
        variant: "compact",
        showControls: false,
        mode: "detailed",
        density: "comfortable",
        layout: "grid",
      },
      gridSize: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
      },
      visible: {
        minimal: false,
        compact: false,
        detailed: false,
        fullscreen: true,
        overview: false,
      },
    },

    // 10. Общая статистика - Низкий приоритет
    {
      id: "general-stats",
      component: DashboardStatsWidget,
      priority: 10,
      size: "medium",
      props: {
        variant: "compact",
        showComparisons: false,
        mode: "detailed",
        density: "comfortable",
        layout: "grid",
      },
      gridSize: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 4,
        xl: 4,
      },
      visible: {
        minimal: false,
        compact: false,
        detailed: false,
        fullscreen: true,
        overview: false,
      },
    },
  ];

  return widgets;
};

/**
 * Получить виджеты для конкретного режима дашборда
 */
export const getWidgetsForMode = (
  widgets: DashboardWidget[],
  mode: DashboardMode
): DashboardWidget[] => {
  return widgets
    .filter((widget) => widget.visible[mode])
    .map((widget) => ({
      ...widget,
      props: {
        ...widget.props,
        mode,
        variant:
          mode === "minimal"
            ? "compact"
            : mode === "compact"
            ? "compact"
            : mode === "detailed"
            ? "detailed"
            : "detailed",
      },
    }))
    .sort((a, b) => a.priority - b.priority);
};

/**
 * Получить виджеты для конкретного layout'а
 */
export const getWidgetsForLayout = (
  widgets: DashboardWidget[],
  layout: DashboardLayoutType,
  density: DashboardDensity = "comfortable"
): DashboardWidget[] => {
  return widgets.map((widget) => {
    let adjustedGridSize = { ...widget.gridSize };

    // Адаптация размеров для разных layout'ов
    if (layout === "list") {
      adjustedGridSize = {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
      };
    } else if (layout === "masonry") {
      // Для masonry сохраняем оригинальные размеры
      adjustedGridSize = widget.gridSize;
    }

    // Адаптация для плотности
    const densityVariant =
      density === "compact"
        ? "compact"
        : density === "dense"
        ? "minimal"
        : "detailed";

    return {
      ...widget,
      gridSize: adjustedGridSize,
      props: {
        ...widget.props,
        layout,
        density,
        variant: widget.props.variant || densityVariant,
      },
    };
  });
};

/**
 * Создать конфигурацию виджетов для полного дашборда
 */
export const createFullDashboardConfig = (
  mode: DashboardMode = "detailed",
  layout: DashboardLayoutType = "grid",
  density: DashboardDensity = "comfortable",
  overview?: any,
  timelineData?: any[],
  distributionData?: any[]
) => {
  // Создаем базовые виджеты
  const baseWidgets = createDashboardWidgets(
    overview || {},
    timelineData || [],
    distributionData || []
  );

  // Фильтруем по режиму
  const modeWidgets = getWidgetsForMode(baseWidgets, mode);

  // Адаптируем под layout
  const finalWidgets = getWidgetsForLayout(modeWidgets, layout, density);

  return finalWidgets;
};

/**
 * Получить количество колонок для grid layout
 */
export const getGridColumns = (
  mode: DashboardMode,
  layout: DashboardLayoutType
): number => {
  if (layout !== "grid") return 1;

  switch (mode) {
    case "minimal":
      return 1;
    case "compact":
      return 2;
    case "detailed":
      return 3;
    case "fullscreen":
      return 4;
    default:
      return 3;
  }
};

/**
 * Получить настройки spacing для разных режимов
 */
export const getSpacingConfig = (
  mode: DashboardMode,
  density: DashboardDensity
) => {
  const baseSpacing = {
    minimal: { container: 1, grid: 1 },
    compact: { container: 2, grid: 1.5 },
    detailed: { container: 3, grid: 2 },
    fullscreen: { container: 4, grid: 3 },
    overview: { container: 2.5, grid: 1.75 },
  };

  const densityMultiplier = {
    dense: 0.75,
    compact: 0.875,
    comfortable: 1,
    spacious: 1.25,
  };

  const base = baseSpacing[mode];
  const multiplier = densityMultiplier[density];

  return {
    container: base.container * multiplier,
    grid: base.grid * multiplier,
  };
};
