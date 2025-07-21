import React from "react";
import type { DashboardWidget } from "../ui/DashboardLayoutRenderer";

// Widget Components
import { EnhancedDashboardStatsWidget } from "@/features/dashboard/ui/EnhancedDashboardStatsWidget";
import { ChartsManagementWidget } from "@/features/charts";
import { QuickActionsWidget } from "@/widgets";
import { ProjectOverviewWidget } from "@/widgets/project-overview";
import { SystemHealthWidget } from "@/widgets/system-health";
import { ActivityFeedWidget } from "@/widgets/dashboard-activity-feed";

// Create widget configuration for the new layout system
export const createDashboardWidgets = (
  overview: any,
  timelineData: any[],
  distributionData: any[]
): DashboardWidget[] => {
  const widgets: DashboardWidget[] = [
    // 1. Key Metrics - Highest Priority (большой виджет)
    {
      id: "key-metrics",
      component: EnhancedDashboardStatsWidget,
      priority: 1,
      size: "large", // Занимает 2 колонки при возможности
      props: {
        variant: "detailed",
        showTrends: true,
        // These will be overridden by getWidgetsForMode and getWidgetsForLayout
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
        minimal: true,
        compact: true,
        detailed: true,
        fullscreen: true,
      },
    },

    // 2. Charts Management - High Priority (большой виджет)
    {
      id: "charts-management",
      component: ChartsManagementWidget,
      priority: 2,
      size: "large", // Занимает 2 колонки при возможности
      props: {
        variant: "detailed",
        showControls: true,
        defaultExpanded: true,
        maxCharts: 6,
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
        compact: true,
        detailed: true,
        fullscreen: true,
      },
    },

    // 3. Quick Actions - Medium Priority (маленький виджет)
    {
      id: "quick-actions",
      component: QuickActionsWidget,
      priority: 3,
      size: "small", // Занимает 1 колонку
      props: {
        variant: "detailed",
        maxActions: 8,
        showCategories: true,
        showShortcuts: true,
        showFavorites: true,
      },
      gridSize: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 4,
      },
      visible: {
        minimal: true,
        compact: true,
        detailed: true,
        fullscreen: true,
      },
    },

    // 4. Project Overview - Medium Priority (маленький виджет)
    {
      id: "project-overview",
      component: ProjectOverviewWidget,
      priority: 4,
      size: "small", // Занимает 1 колонку
      props: {},
      gridSize: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 4,
      },
      visible: {
        minimal: false,
        compact: true,
        detailed: true,
        fullscreen: true,
      },
    },

    // 5. Activity Feed - Medium Priority (средний виджет)
    {
      id: "activity-feed",
      component: ({ layout, ...props }) => (
        <ActivityFeedWidget
          {...props}
          maxItems={layout === "list" ? 12 : 8}
          showFilters={layout !== "minimal"}
          infiniteScroll={false}
        />
      ),
      priority: 5,
      size: "medium", // Адаптивный размер
      props: {},
      gridSize: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 4,
      },
      visible: {
        minimal: false,
        compact: true,
        detailed: true,
        fullscreen: true,
      },
    },

    // 6. System Health - Lower Priority (маленький виджет)
    {
      id: "system-health",
      component: SystemHealthWidget,
      priority: 6,
      size: "small", // Занимает 1 колонку
      props: {},
      gridSize: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 4,
        xl: 3,
      },
      visible: {
        minimal: false,
        compact: false,
        detailed: true,
        fullscreen: true,
      },
    },
  ];

  return widgets;
};

// Mode-specific widget filters and adjustments
export const getWidgetsForMode = (
  widgets: DashboardWidget[],
  mode: "minimal" | "compact" | "detailed" | "fullscreen"
): DashboardWidget[] => {
  return widgets
    .filter((widget) => widget.visible?.[mode] !== false)
    .map((widget) => {
      // Mode-specific adjustments
      const adjustedWidget = { ...widget };

      if (mode === "minimal") {
        // Minimal mode adjustments
        adjustedWidget.props = {
          ...widget.props,
          variant: "minimal",
          mode: "minimal",
          density: "dense",
          maxActions: 4,
          showCategories: false,
          showTrends: false,
          showControls: false,
          maxCharts: 3,
        };
      } else if (mode === "compact") {
        // Compact mode adjustments
        adjustedWidget.props = {
          ...widget.props,
          variant: "compact",
          mode: "compact",
          density: "compact",
          maxActions: 6,
          showCategories: true,
          showTrends: false,
          showControls: true,
          maxCharts: 4,
        };
      } else if (mode === "fullscreen") {
        // Fullscreen mode adjustments
        adjustedWidget.props = {
          ...widget.props,
          variant: "detailed",
          mode: "fullscreen",
          density: "comfortable",
          maxActions: 12,
          showCategories: true,
          showTrends: true,
          showControls: true,
          maxCharts: 8,
        };

        // Larger grid sizes for fullscreen
        adjustedWidget.gridSize = {
          xs: 12,
          sm: 6,
          md: 4,
          lg: 3,
          xl: 2,
        };
      } else {
        // Default detailed mode
        adjustedWidget.props = {
          ...widget.props,
          mode: "detailed",
          density: "comfortable",
        };
      }

      return adjustedWidget;
    })
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
};

// Layout-specific widget adjustments
export const getWidgetsForLayout = (
  widgets: DashboardWidget[],
  layout: "grid" | "list" | "masonry",
  mode?: "minimal" | "compact" | "detailed" | "fullscreen",
  isUltrawide?: boolean,
  isWidescreen?: boolean
): DashboardWidget[] => {
  return widgets.map((widget) => {
    const adjustedWidget = { ...widget };

    if (layout === "list") {
      // List layout - full width, optimized for vertical scrolling
      adjustedWidget.gridSize = {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
      };

      adjustedWidget.props = {
        ...widget.props,
        layout: "list",
        horizontal: mode === "minimal",
        compact: mode === "minimal",
        fullWidth: true,
        ultrawide: isUltrawide,
        widescreen: isWidescreen,
        // List-specific optimizations
        listOptimized: true,
        showDividers: mode === "detailed",
      };
    } else if (layout === "masonry") {
      // Masonry layout - flexible sizing based on content and screen size
      if (isUltrawide) {
        adjustedWidget.gridSize = {
          xs: 12,
          sm: 6,
          md: 4,
          lg: 2,
          xl: 2,
        };
      } else if (isWidescreen) {
        adjustedWidget.gridSize = {
          xs: 12,
          sm: 6,
          md: 4,
          lg: 3,
          xl: 3,
        };
      } else {
        adjustedWidget.gridSize = {
          xs: 12,
          sm: 6,
          md: 4,
          lg: 3,
          xl: 3,
        };
      }

      adjustedWidget.props = {
        ...widget.props,
        layout: "masonry",
        compact: false,
        flexible: true,
        masonry: true,
        // Enhanced masonry properties
        preventBreakInside: true,
        responsiveHeight: true,
        isUltrawide,
        isWidescreen,
      };
    } else {
      // Grid layout - responsive grid configuration
      if (isUltrawide) {
        // Enhanced grid for ultrawide displays
        adjustedWidget.gridSize = {
          xs: 12,
          sm: 6,
          md: 4,
          lg: 3,
          xl: 2,
        };
      } else if (isWidescreen) {
        // Optimized grid for widescreen displays
        adjustedWidget.gridSize = {
          xs: 12,
          sm: 6,
          md: 4,
          lg: 3,
          xl: 3,
        };
      } else {
        // Standard grid configuration
        adjustedWidget.gridSize = {
          xs: 12,
          sm: 6,
          md: 4,
          lg: 4,
          xl: 4,
        };
      }

      adjustedWidget.props = {
        ...widget.props,
        layout: "grid",
        compact: mode === "minimal",
        // Grid-specific responsive properties
        gridOptimized: true,
        isUltrawide,
        isWidescreen,
        responsiveGrid: true,
      };
    }

    // Common responsive properties for all layouts
    adjustedWidget.props = {
      ...adjustedWidget.props,
      // Screen size information
      isUltrawide: isUltrawide || false,
      isWidescreen: isWidescreen || false,
      // Mode information
      mode: mode || "detailed",
      // Performance optimizations
      lazyLoad: true,
      memoized: true,
      // Accessibility improvements
      ariaOptimized: true,
    };

    return adjustedWidget;
  });
};
