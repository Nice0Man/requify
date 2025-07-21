import React, { memo, useMemo } from "react";
import { Grid, Box, useTheme, alpha, Skeleton, useMediaQuery } from "@mui/material";
import type {
  DashboardMode,
  DashboardDensity,
} from "@/widgets/dashboard-container";
import type { DashboardWidget } from "./DashboardLayoutRenderer";

interface GridLayoutRendererProps {
  mode: DashboardMode;
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
  ({ mode, density, widgets, spacing, onWidgetClick }) => {
    const theme = useTheme();

    // Detect different screen sizes for optimal grid layout
    const isUltrawide = useMediaQuery('(min-aspect-ratio: 21/9) and (min-width: 2560px)');
    const isWidescreen = useMediaQuery('(min-aspect-ratio: 16/9) and (min-width: 1920px)');
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.up('sm'));

    // Sort widgets by priority for optimal grid placement
    const sortedWidgets = useMemo(() => {
      return [...widgets].sort((a, b) => {
        const priorityA = a.priority || 999;
        const priorityB = b.priority || 999;
        return priorityA - priorityB;
      });
    }, [widgets]);

    // Get responsive grid configuration based on mode and screen size
    const getGridConfig = (widget: DashboardWidget) => {
      // Enhanced responsive configuration for ultrawide and widescreen displays
      if (isUltrawide) {
        if (mode === "minimal") {
          return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };
        }
        if (mode === "compact") {
          return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };
        }
        if (mode === "detailed") {
          return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };
        }
        if (mode === "fullscreen") {
          return { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 };
        }
      }

      if (isWidescreen) {
        if (mode === "minimal") {
          return { xs: 12, sm: 6, md: 6, lg: 4, xl: 3 };
        }
        if (mode === "compact") {
          return { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 };
        }
        if (mode === "detailed") {
          return { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 };
        }
        if (mode === "fullscreen") {
          return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };
        }
      }

      // Standard responsive configuration for regular screens
      if (mode === "minimal") {
        return { xs: 12, sm: 12, md: 6, lg: 6, xl: 4 };
      }

      if (mode === "compact") {
        return { xs: 12, sm: 6, md: 6, lg: 4, xl: 3 };
      }

      if (mode === "fullscreen") {
        return { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 };
      }

      // Default detailed mode
      const defaultConfig = {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 4,
        xl: 4,
      };

      // Use widget-specific grid size or default
      return widget.gridSize || defaultConfig;
    };

    // Get widget order based on responsive breakpoints and priority
    const getWidgetOrder = (widget: DashboardWidget) => {
      if (widget.order) {
        return { order: widget.order };
      }

      // Priority-based ordering with responsive adjustments
      const basePriority = widget.priority || 999;
      
      return {
        order: {
          xs: basePriority,
          sm: basePriority,
          md: basePriority,
          lg: basePriority,
          xl: basePriority,
        },
      };
    };

    // Loading skeleton for grid layout
    const renderLoadingSkeleton = () => {
      const skeletonCount = isUltrawide ? 20 : isWidescreen ? 16 : 12;

      return (
        <Grid container spacing={spacing}>
          {Array.from({ length: skeletonCount }).map((_, index) => {
            const skeletonGridConfig = getGridConfig({
              id: `skeleton-${index}`,
              component: () => null,
            });

            return (
              <Grid item key={`skeleton-${index}`} {...skeletonGridConfig}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    background: alpha(theme.palette.background.paper, 0.7),
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    height: mode === "minimal" ? 200 : mode === "compact" ? 250 : 300,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    animation: `skeletonPulse 1.5s ease-in-out infinite ${index * 0.1}s`,
                    "@keyframes skeletonPulse": {
                      "0%, 100%": { opacity: 0.6 },
                      "50%": { opacity: 0.8 },
                    },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Skeleton
                      variant="rectangular"
                      width={40}
                      height={40}
                      sx={{
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={24}
                      height={24}
                      sx={{
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      }}
                    />
                  </Box>
                  <Skeleton variant="text" width="80%" height={24} />
                  <Skeleton variant="text" width="60%" height={16} />
                  <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Skeleton
                      variant="rectangular"
                      width="90%"
                      height="60%"
                      sx={{
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                      }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Skeleton variant="text" width="30%" height={14} />
                    <Skeleton variant="text" width="25%" height={14} />
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      );
    };

    if (widgets.length === 0) {
      return renderLoadingSkeleton();
    }

    return (
      <Box
        sx={{
          width: "100%",
          // Enhanced grid animations for different screen sizes
          "& .MuiGrid-item": {
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          // Responsive hover effects
          "& .dashboard-widget": {
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: mode === "fullscreen" ? "none" : "translateY(-2px)",
              zIndex: 2,
              // Enhanced shadow on ultrawide screens
              "& > *": {
                boxShadow: isUltrawide 
                  ? `0 12px 40px ${alpha(theme.palette.common.black, 0.1)}`
                  : `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
              },
            },
          },
          // Grid entrance animation
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
        }}
      >
        <Grid
          container
          spacing={spacing}
          sx={{
            // Ensure consistent alignment across all breakpoints
            "& .MuiGrid-item": {
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
            },
            // Enhanced masonry-like behavior for uneven heights
            ...(density === "comfortable" && {
              alignItems: "stretch",
              "& .MuiGrid-item > *": {
                height: "100%",
                display: "flex",
                flexDirection: "column",
              },
            }),
            // Optimizations for ultrawide displays
            ...(isUltrawide && {
              "& .MuiGrid-item": {
                minHeight: mode === "minimal" ? 200 : mode === "compact" ? 240 : 280,
              },
            }),
          }}
        >
          {sortedWidgets.map((widget, index) => {
            const gridConfig = getGridConfig(widget);
            const orderConfig = getWidgetOrder(widget);
            const WidgetComponent = widget.component;

            return (
              <Grid
                item
                key={widget.id}
                {...gridConfig}
                data-small={widget.size === "small" ? "true" : "false"}
                data-large={widget.size === "large" ? "true" : "false"}
                sx={{
                  ...orderConfig,
                  // Enhanced responsive visibility
                  display: {
                    xs: gridConfig.xs === 0 ? "none" : "flex",
                    sm: gridConfig.sm === 0 ? "none" : "flex",
                    md: gridConfig.md === 0 ? "none" : "flex",
                    lg: gridConfig.lg === 0 ? "none" : "flex",
                    xl: gridConfig.xl === 0 ? "none" : "flex",
                  },
                  // Staggered animation entrance based on priority and index
                  animation: `fadeInUp 0.6s ease-out ${(widget.priority || index) * 0.05}s both`,
                  "@keyframes fadeInUp": {
                    "0%": {
                      opacity: 0,
                      transform: "translateY(30px) scale(0.95)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateY(0) scale(1)",
                    },
                  },
                  // Enhanced responsive min-height for consistent grid alignment
                  minHeight: {
                    xs: mode === "minimal" ? 180 : mode === "compact" ? 220 : 260,
                    sm: mode === "minimal" ? 200 : mode === "compact" ? 240 : 280,
                    md: mode === "minimal" ? 220 : mode === "compact" ? 260 : 300,
                    lg: isUltrawide && mode === "detailed" ? 320 : mode === "minimal" ? 240 : mode === "compact" ? 280 : 320,
                    xl: isUltrawide && mode === "detailed" ? 340 : mode === "minimal" ? 260 : mode === "compact" ? 300 : 340,
                  },
                }}
              >
                <Box
                  className="dashboard-widget"
                  onClick={() => onWidgetClick?.(widget.id)}
                  sx={{
                    width: "100%",
                    height: "100%",
                    cursor: onWidgetClick ? "pointer" : "default",
                    background: "transparent",
                    borderRadius: mode === "fullscreen" ? 2 : 3,
                    overflow: "hidden",
                    p: 0,
                    position: "relative",
                    // Enhanced interaction feedback
                    "&:active": {
                      transform: mode === "fullscreen" ? "none" : "scale(0.98)",
                    },
                  }}
                >
                  <WidgetComponent
                    {...widget.props}
                    mode={mode}
                    density={density}
                    layout="grid"
                    compact={density === "dense"}
                    // Pass screen size info to widgets for responsive behavior
                    isUltrawide={isUltrawide}
                    isWidescreen={isWidescreen}
                    isLargeScreen={isLargeScreen}
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
