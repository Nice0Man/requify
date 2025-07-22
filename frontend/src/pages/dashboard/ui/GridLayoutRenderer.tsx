import React, { memo, useMemo, useCallback } from "react";
import {
  Grid,
  Box,
  useTheme,
  alpha,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import { useLayoutCalculations } from "@/shared/hooks";
import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/types/dashboard";
import type { DashboardWidget } from "./DashboardLayoutRenderer";

interface GridLayoutRendererProps {
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  widgets: DashboardWidget[];
  spacing: {
    xs: number;
    sm: number;
    md: number;
  };
  onWidgetClick?: (widgetId: string) => void;
  onLayoutChange?: (layout: any) => void;
}

export const GridLayoutRenderer = memo<GridLayoutRendererProps>(
  ({ mode, layout, density, widgets, spacing, onWidgetClick }) => {
    const theme = useTheme();

    // Получаем точные расчеты layout без overflow костылей
    const { dimensions, breakpoints } = useLayoutCalculations({
      mode,
      layout,
      density,
      sidebarCollapsed: false, // Состояние сайдбара передается из верхнего уровня
    });

    // Точные расчеты для grid конфигурации
    const gridConfig = useMemo(
      () => ({
        container: true,
        spacing: Math.round(dimensions.grid.gap / 8), // Material-UI использует множители 8px
        columns: 12, // Базовая MUI система
        sx: {
          width: `${dimensions.content.maxWidth}px`, // Точная ширина из расчетов
          maxWidth: `${dimensions.content.maxWidth}px`,
          margin: "0 auto",
          boxShadow: "none", // Без теней на контейнере
        },
      }),
      [dimensions]
    );

    // Sort widgets by priority and adjust for layout
    const sortedWidgets = useMemo(() => {
      return [...widgets]
        .sort((a, b) => {
          const priorityA = a.priority || 999;
          const priorityB = b.priority || 999;
          return priorityA - priorityB;
        })
        .slice(
          0,
          mode === "minimal" ? 6 : mode === "compact" ? 12 : widgets.length
        );
    }, [widgets, mode]);

    // Context7: Точные расчеты размеров виджетов без overflow проблем
    const getWidgetSize = useCallback(
      (widget: any, index: number) => {
        // Рассчитываем размеры на основе точных grid dimensions
        const { isMobile, isTablet, isDesktop, isWidescreen, isUltrawide } =
          breakpoints;

        // Базовая ширина элемента в колонках (из 12)
        let baseColumns = 12;

        if (isMobile) {
          baseColumns = 12; // Полная ширина на мобильном
        } else if (isTablet) {
          baseColumns = mode === "minimal" ? 12 : 6;
        } else if (isDesktop) {
          baseColumns = mode === "minimal" ? 6 : mode === "fullscreen" ? 3 : 4;
        } else if (isWidescreen) {
          baseColumns = mode === "minimal" ? 4 : mode === "fullscreen" ? 3 : 3;
        } else if (isUltrawide) {
          baseColumns = mode === "minimal" ? 3 : mode === "fullscreen" ? 2 : 2;
        }

        // Корректировка для density
        if (density === "dense") {
          baseColumns = Math.max(baseColumns - 1, 2);
        } else if (density === "comfortable") {
          baseColumns = Math.min(baseColumns + 1, 12);
        }

        // Возвращаем единый размер для всех breakpoints
        return {
          xs: 12,
          sm: isMobile ? 12 : baseColumns,
          md: baseColumns,
          lg: baseColumns,
        };
      },
      [mode, density, dimensions, breakpoints]
    );

    const renderLoadingSkeleton = useCallback(() => {
      const skeletonCount =
        mode === "minimal" ? 4 : mode === "compact" ? 8 : 12;

      return (
        <Grid {...gridConfig}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Grid item key={`skeleton-${index}`} {...getWidgetSize({}, index)}>
              <Box
                sx={{
                  height: { xs: 200, sm: 240, md: 280 },
                  background: `linear-gradient(90deg, 
                    ${alpha(theme.palette.grey[300], 0.3)} 0%, 
                    ${alpha(theme.palette.grey[100], 0.5)} 50%, 
                    ${alpha(theme.palette.grey[300], 0.3)} 100%)`,
                  borderRadius: mode === "fullscreen" ? 2 : 3,
                  animation: "shimmer 1.5s ease-in-out infinite",
                  "@keyframes shimmer": {
                    "0%": { backgroundPosition: "-200px 0" },
                    "100%": { backgroundPosition: "calc(200px + 100%) 0" },
                  },
                  // Context7: No shadows on loading skeleton
                  boxShadow: "none",
                }}
              />
            </Grid>
          ))}
        </Grid>
      );
    }, [mode, theme, gridConfig, getWidgetSize]);

    if (widgets.length === 0) {
      return renderLoadingSkeleton();
    }

    return (
      <Box
        sx={{
          // Context7: Точные размеры без overflow костылей
          width: `${dimensions.content.maxWidth}px`,
          maxWidth: `${dimensions.content.maxWidth}px`,
          margin: "0 auto",
          padding: 0,
          boxShadow: "none",

          // Grid animations
          animation: "gridFadeIn 0.8s ease-out",
          "@keyframes gridFadeIn": {
            "0%": {
              opacity: 0,
              transform: "scale(0.98)",
            },
            "100%": {
              opacity: 1,
              transform: "scale(1)",
            },
          },

          // Grid item стили с точными размерами
          "& .MuiGrid-item": {
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            width: `${dimensions.grid.itemWidth}px`,
            maxWidth: `${dimensions.grid.itemWidth}px`,
            minHeight: `${dimensions.grid.itemHeight}px`,
          },

          // Widget стили с точными размерами
          "& .dashboard-widget": {
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: mode === "fullscreen" ? "none" : "translateY(-2px)",
              zIndex: 2,
            },
          },
        }}
      >
        <Grid {...gridConfig}>
          {sortedWidgets.map((widget, index) => {
            const WidgetComponent = widget.component;
            const gridSize = getWidgetSize(widget, index);

            return (
              <Grid
                item
                key={widget.id}
                {...gridSize}
                sx={{
                  // Context7: Правильный sizing для предотвращения cropping
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0, // Важно для flex shrinking
                  minHeight: 0,
                  maxWidth: "100%",
                  width: "100%",
                  // Context7: Предотвращаем overflow на уровне grid item
                  overflow: "hidden",
                  // Staggered animation entrance
                  animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`,
                  "@keyframes fadeInUp": {
                    "0%": {
                      opacity: 0,
                      transform: "translateY(20px) scale(0.95)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateY(0) scale(1)",
                    },
                  },
                }}
              >
                <Box
                  className="dashboard-widget"
                  onClick={() => onWidgetClick?.(widget.id)}
                  sx={{
                    // Context7: Правильный sizing для предотвращения content cropping
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                    minWidth: 0, // Важно для flex shrinking
                    minHeight: 0,
                    maxWidth: "100%",
                    cursor: onWidgetClick ? "pointer" : "default",
                    background: "transparent",
                    borderRadius: mode === "fullscreen" ? 2 : 3,
                    // Context7: Proper overflow handling - предотвращаем overflow-x
                    overflowX: "hidden",
                    overflowY: "auto",
                    padding: 0,
                    position: "relative",
                    // Context7: No shadows here - widget handles its own
                    boxShadow: "none",
                    // Proper containment
                    contain: "layout style paint",
                    // Enhanced interaction feedback
                    "&:active": {
                      transform: mode === "fullscreen" ? "none" : "scale(0.98)",
                    },
                  }}
                >
                  <WidgetComponent
                    {...widget.props}
                    mode={mode}
                    layout={layout}
                    density={density}
                    // Pass calculated breakpoints to widgets
                    breakpoints={breakpoints}
                    dimensions={dimensions}
                    gridSize={gridConfig}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }
);

GridLayoutRenderer.displayName = "GridLayoutRenderer";
