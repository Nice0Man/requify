import { memo, useMemo } from "react";
import { Box, useTheme, alpha, Skeleton, useMediaQuery } from "@mui/material";
import type {
  DashboardMode,
  DashboardDensity,
} from "@/shared/types/dashboard";
import type { DashboardWidget } from "./DashboardLayoutRenderer";

interface MasonryLayoutRendererProps {
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

export const MasonryLayoutRenderer = memo<MasonryLayoutRendererProps>(
  ({ mode, density, widgets, spacing, onWidgetClick }) => {
    const theme = useTheme();

    // Detect different screen sizes
    const isUltrawide = useMediaQuery('(min-aspect-ratio: 21/9) and (min-width: 2560px)');
    const isWidescreen = useMediaQuery('(min-aspect-ratio: 16/9) and (min-width: 1920px)');
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.up('sm'));
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Sort widgets by priority for optimal masonry placement
    const sortedWidgets = useMemo(() => {
      return [...widgets].sort((a, b) => {
        const priorityA = a.priority || 999;
        const priorityB = b.priority || 999;
        return priorityA - priorityB;
      });
    }, [widgets]);

    // Calculate responsive columns based on screen size and mode - more conservative approach
    const getColumnCount = () => {
      if (isMobile) return 1;
      
      if (isUltrawide) {
        return mode === "minimal" ? 3 : mode === "compact" ? 4 : mode === "detailed" ? 5 : 4;
      }
      if (isWidescreen) {
        return mode === "minimal" ? 2 : mode === "compact" ? 3 : mode === "detailed" ? 4 : 3;
      }
      if (isLargeScreen) {
        return mode === "minimal" ? 2 : mode === "compact" ? 3 : mode === "detailed" ? 3 : 3;
      }
      if (isMediumScreen) {
        return mode === "minimal" ? 2 : mode === "compact" ? 2 : 3;
      }
      if (isSmallScreen) {
        return mode === "minimal" ? 1 : 2;
      }
      return 1; // Mobile fallback
    };

    const columnCount = getColumnCount();

    // Get minimum column width to prevent overcrowding
    const getMinColumnWidth = () => {
      const baseWidth = {
        minimal: 280,
        compact: 320,
        detailed: 360,
        fullscreen: 300,
      };
      
      const densityMultiplier = {
        dense: 0.9,
        compact: 0.95,
        comfortable: 1,
      };

      return baseWidth[mode] * densityMultiplier[density];
    };

    const minColumnWidth = getMinColumnWidth();

    // Enhanced widget height calculation with better variation control
    const getWidgetHeight = (widget: DashboardWidget, index: number) => {
      const baseHeights = {
        minimal: 200,
        compact: 240,
        detailed: 280,
        fullscreen: 260,
      };

      const densityMultiplier = {
        dense: 0.85,
        compact: 0.92,
        comfortable: 1,
      };

      // More controlled height variation
      const priorityMultiplier = widget.priority ? 
        Math.max(0.8, Math.min(1.3, 1 + (5 - widget.priority) * 0.06)) : 1;
      
      // Reduced variation for better balance
      const variationMultiplier = 0.9 + (index % 3) * 0.2;

      return Math.floor(
        baseHeights[mode] * densityMultiplier[density] * priorityMultiplier * variationMultiplier
      );
    };

    // Grid template calculation
    const getGridConfig = () => {
      return {
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}px, 1fr))`,
        gridAutoRows: `minmax(${mode === "minimal" ? 180 : mode === "compact" ? 220 : 260}px, auto)`,
        gridAutoFlow: "row dense", // Important for masonry-like packing
      };
    };

    const gridConfig = getGridConfig();

    // Loading skeleton for masonry layout
    const renderLoadingSkeleton = () => {
      const skeletonCount = Math.min(columnCount * 3, 12);

      return (
        <Box
          sx={{
            display: "grid",
            ...gridConfig,
            gap: spacing.md,
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: skeletonCount }).map((_, index) => {
            const randomHeight = 200 + (index % 3) * 80;

            return (
              <Box
                key={`skeleton-${index}`}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: alpha(theme.palette.background.paper, 0.7),
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  minHeight: randomHeight,
                  maxHeight: randomHeight + 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  animation: `skeletonPulse 1.5s ease-in-out infinite ${index * 0.1}s`,
                  overflow: "hidden",
                  "@keyframes skeletonPulse": {
                    "0%, 100%": { opacity: 0.6 },
                    "50%": { opacity: 0.8 },
                  },
                }}
              >
                <Skeleton
                  variant="rectangular"
                  height="45%"
                  sx={{
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                />
                <Skeleton variant="text" width="75%" height={20} />
                <Skeleton variant="text" width="50%" height={16} />
                <Box sx={{ mt: "auto" }}>
                  <Skeleton variant="text" width="60%" height={14} />
                </Box>
              </Box>
            );
          })}
        </Box>
      );
    };

    if (widgets.length === 0) {
      return renderLoadingSkeleton();
    }

    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden", // Prevent container overflow
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
            ...gridConfig,
            gap: spacing.md,
            width: "100%",
            maxWidth: "100%",
            
            // Responsive grid adjustments
            [theme.breakpoints.down('lg')]: {
              gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth * 0.9}px, 1fr))`,
            },
            [theme.breakpoints.down('md')]: {
              gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth * 0.8}px, 1fr))`,
            },
            [theme.breakpoints.down('sm')]: {
              gridTemplateColumns: mode === "minimal" ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
            },
            
            // Enhanced widget styles
            "& > *": {
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transformOrigin: "center top",
              overflow: "hidden", // Prevent individual widget overflow
              
              // Staggered animation entrance
              opacity: 0,
              animation: "masonryItemFadeIn 0.6s ease-out forwards",
              
              "&:hover": {
                transform: mode === "fullscreen" 
                  ? "scale(1.01)" 
                  : "scale(1.02) translateZ(0)",
                zIndex: 10,
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
            
            // Enhanced hover effects for masonry items
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
              
              // Subtle shadow on hover for better feedback
              "&:hover": {
                "& > *": {
                  boxShadow: mode === "fullscreen" 
                    ? `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`
                    : `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                },
              },
            },
          }}
        >
          {sortedWidgets.map((widget, index) => {
            const WidgetComponent = widget.component;
            const widgetHeight = getWidgetHeight(widget, index);

            // Determine grid span based on priority and index for organic layout
            const getGridSpan = () => {
              if (columnCount === 1) return 1;
              
              // High priority widgets can span more columns
              const priority = widget.priority || 999;
              const canSpan = priority <= 3 && index < 4;
              
              if (canSpan && columnCount >= 3) {
                return index % 3 === 0 ? 2 : 1; // Every 3rd high-priority widget spans 2 columns
              }
              
              return 1;
            };

            const gridSpan = getGridSpan();

            return (
              <Box
                key={widget.id}
                className="masonry-item"
                sx={{
                  gridColumn: gridSpan > 1 ? `span ${gridSpan}` : "auto",
                  minHeight: widgetHeight,
                  maxHeight: "fit-content",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <Box
                  className="dashboard-widget"
                  onClick={() => onWidgetClick?.(widget.id)}
                  sx={{
                    minHeight: widgetHeight,
                    height: "100%",
                    maxHeight: "fit-content",
                    overflow: "hidden",
                  }}
                >
                  <WidgetComponent
                    {...widget.props}
                    mode={mode}
                    density={density}
                    layout="masonry"
                    compact={density === "dense"}
                    flexible={true}
                    masonry={true}
                    height={widgetHeight}
                    maxHeight={widgetHeight + 100}
                    overflow="hidden"
                    // Pass responsive info to widgets
                    columnCount={columnCount}
                    gridSpan={gridSpan}
                    isUltrawide={isUltrawide}
                    isWidescreen={isWidescreen}
                    isMobile={isMobile}
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
