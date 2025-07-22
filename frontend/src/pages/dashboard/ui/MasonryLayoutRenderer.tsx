import { memo, useMemo, useCallback } from "react";
import { Box, useTheme, alpha, useMediaQuery } from "@mui/material";
import { useLayoutCalculations } from "@/shared/hooks";
import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/types/dashboard";
import type { DashboardWidget } from "./DashboardLayoutRenderer";
import { DASHBOARD_TOKENS } from "@/shared/styles";

interface MasonryLayoutRendererProps {
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

export const MasonryLayoutRenderer = memo<MasonryLayoutRendererProps>(
  ({ mode, layout, density, widgets, spacing, onWidgetClick }) => {
    const theme = useTheme();

    // Получаем точные расчеты layout без overflow костылей
    const { dimensions, breakpoints } = useLayoutCalculations({
      mode,
      layout,
      density,
      sidebarCollapsed: false,
    });

    // Context7: Точные расчеты masonry без overflow костылей
    const masonryConfig = useMemo(() => {
      // Используем готовые расчеты из хука
      const columnCount = dimensions.grid.columns;
      const gap = dimensions.grid.gap;
      const itemWidth = dimensions.grid.itemWidth;

      return {
        columnCount,
        minColumnWidth: itemWidth,
        gap,
        // Context7: Точные расчеты для CSS grid masonry
        gridTemplateColumns: `repeat(${columnCount}, minmax(${itemWidth}px, 1fr))`,
      };
    }, [dimensions]);

    // Sort widgets by priority for optimal masonry layout
    const sortedWidgets = useMemo(() => {
      return [...widgets]
        .sort((a, b) => {
          const priorityA = a.priority || 999;
          const priorityB = b.priority || 999;
          return priorityA - priorityB;
        })
        .slice(
          0,
          mode === "minimal" ? 8 : mode === "compact" ? 16 : widgets.length
        );
    }, [widgets, mode]);

    // Context7: Enhanced widget height calculation
    const getWidgetHeight = useCallback(
      (widget: any, index: number) => {
        const baseHeight = {
          minimal: 200,
          compact: 240,
          detailed: 280,
          fullscreen: 320,
        }[mode];

        // Density adjustments
        const densityMultiplier = {
          dense: 0.85,
          compact: 0.9,
          comfortable: 1,
        }[density];

        // Widget-specific height or calculated height
        return widget.height || Math.floor(baseHeight * densityMultiplier);
      },
      [mode, density]
    );

    const renderLoadingSkeleton = useCallback(() => {
      const skeletonCount = masonryConfig.columnCount * 3; // 3 rows

      return (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: masonryConfig.gridTemplateColumns,
            gap: masonryConfig.gap,
            width: "100%",
            // Context7: No overflow issues
            maxWidth: "100%",
            overflow: "visible",
          }}
        >
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Box
              key={`skeleton-${index}`}
              sx={{
                height: getWidgetHeight({}, index),
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
                // Prevent overflow
                overflow: "hidden",
                width: "100%",
                maxWidth: "100%",
              }}
            />
          ))}
        </Box>
      );
    }, [mode, theme, masonryConfig, getWidgetHeight]);

    if (widgets.length === 0) {
      return renderLoadingSkeleton();
    }

    return (
      <Box
        sx={{
          // Context7: Правильный sizing для предотвращения overflow
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          // Context7: Предотвращаем overflow-x для masonry
          overflowX: "hidden",
          overflowY: "visible",
          // No shadows at container level
          boxShadow: "none",
          animation: "masonryFadeIn 0.8s ease-out",
          "@keyframes masonryFadeIn": {
            "0%": {
              opacity: 0,
              transform: "scale(0.98)",
            },
            "100%": {
              opacity: 1,
              transform: "scale(1)",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: masonryConfig.gridTemplateColumns,
            gap: masonryConfig.gap,
            width: "100%",
            minWidth: 0,
            maxWidth: "100%",
            // Context7: Предотвращаем overflow на уровне grid
            overflowX: "hidden",
            overflowY: "visible",
            // Context7: Proper grid configuration
            gridAutoRows: "masonry", // CSS Grid Level 3 feature

            // Fallback for browsers without masonry support
            "@supports not (grid-template-rows: masonry)": {
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              maxHeight: "100vh",
              overflowX: "hidden",
              overflowY: "auto",
            },

            // Context7: Responsive grid adjustments
            [theme.breakpoints.down("lg")]: {
              gridTemplateColumns: `repeat(auto-fit, minmax(${
                masonryConfig.minColumnWidth * 0.9
              }px, 1fr))`,
            },
            [theme.breakpoints.down("md")]: {
              gridTemplateColumns: `repeat(auto-fit, minmax(${
                masonryConfig.minColumnWidth * 0.8
              }px, 1fr))`,
            },
            [theme.breakpoints.down("sm")]: {
              gridTemplateColumns: "1fr", // Single column on mobile
            },

            // Context7: Proper widget styling without shadow duplication
            "& > *": {
              // Context7: Правильный sizing для masonry items
              display: "flex",
              flexDirection: "column",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transformOrigin: "center top",
              // Context7: Предотвращаем overflow на уровне items
              overflowX: "hidden",
              overflowY: "auto",
              width: "100%",
              minWidth: 0, // Важно для flex shrinking
              maxWidth: "100%",

              // Staggered animation entrance
              opacity: 0,
              animation: "masonryItemFadeIn 0.6s ease-out forwards",

              "&:hover": {
                transform:
                  mode === "fullscreen" ? "none" : "scale(1.01) translateZ(0)",
                // Context7: Use centralized z-index system
                zIndex: DASHBOARD_TOKENS.zIndex.dashboard.widget.hover,
              },
            },

            // Staggered animation delays
            "& > *:nth-of-type(4n+1)": { animationDelay: "0.1s" },
            "& > *:nth-of-type(4n+2)": { animationDelay: "0.2s" },
            "& > *:nth-of-type(4n+3)": { animationDelay: "0.3s" },
            "& > *:nth-of-type(4n+4)": { animationDelay: "0.4s" },

            "@keyframes masonryItemFadeIn": {
              "0%": {
                opacity: 0,
                transform: "translateY(30px) scale(0.9)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0) scale(1)",
              },
            },

            // Context7: Enhanced masonry item styles
            "& .dashboard-widget": {
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              borderRadius: mode === "fullscreen" ? 2 : 3,
              overflow: "hidden",
              background: "transparent",
              cursor: onWidgetClick ? "pointer" : "default",
              // Context7: No shadows here - widget handles its own
              boxShadow: "none",
              // Proper containment
              contain: "layout style paint",
            },
          }}
        >
          {sortedWidgets.map((widget, index) => {
            const WidgetComponent = widget.component;
            const widgetHeight = getWidgetHeight(widget, index);

            return (
              <Box
                key={widget.id}
                className="masonry-item"
                sx={{
                  minHeight: widgetHeight,
                  height: "fit-content",
                  width: "100%",
                  // Context7: Proper sizing without overflow
                  maxWidth: "100%",
                  overflow: "hidden",
                }}
              >
                <Box
                  className="dashboard-widget"
                  onClick={() => onWidgetClick?.(widget.id)}
                  sx={{
                    minHeight: widgetHeight,
                    height: "100%",
                    // Context7: Proper content sizing
                    maxHeight: "fit-content",
                    overflow: "hidden",
                    width: "100%",
                    maxWidth: "100%",
                  }}
                >
                  <WidgetComponent
                    {...widget.props}
                    mode={mode}
                    layout={layout}
                    density={density}
                    height={widgetHeight}
                    maxHeight={widgetHeight + 100}
                    columnCount={masonryConfig.columnCount}
                    breakpoints={breakpoints}
                    dimensions={dimensions}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }
);

MasonryLayoutRenderer.displayName = "MasonryLayoutRenderer";
