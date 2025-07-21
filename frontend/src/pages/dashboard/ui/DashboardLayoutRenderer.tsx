import React, { memo, useMemo } from "react";
import { Box, useTheme, alpha, useMediaQuery } from "@mui/material";
import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/types/dashboard";

// Layout Renderers
import { GridLayoutRenderer } from "./GridLayoutRenderer";
import { ListLayoutRenderer } from "./ListLayoutRenderer";
import { MasonryLayoutRenderer } from "./MasonryLayoutRenderer";

// Widget configuration
import { getWidgetsForLayout } from "../config/widgetDefinitions";

// Widget Types
export interface DashboardWidget {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  size?: "small" | "medium" | "large"; // For adaptive grid column sizing
  gridSize?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  order?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  visible?: {
    minimal?: boolean;
    compact?: boolean;
    detailed?: boolean;
    fullscreen?: boolean;
  };
  priority?: number; // For masonry layout ordering
}

export interface DashboardLayoutRendererProps {
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  widgets: DashboardWidget[];
  className?: string;
  isLoading?: boolean;
  onWidgetClick?: (widgetId: string) => void;
  onLayoutChange?: (layout: DashboardLayout) => void;
}

export const DashboardLayoutRenderer = memo<DashboardLayoutRendererProps>(
  ({
    mode,
    layout,
    density,
    widgets,
    className,
    isLoading = false,
    onWidgetClick,
    onLayoutChange,
  }) => {
    const theme = useTheme();

    // Detect screen sizes for responsive behavior
    const isUltrawide = useMediaQuery('(min-aspect-ratio: 21/9) and (min-width: 2560px)');
    const isWidescreen = useMediaQuery('(min-aspect-ratio: 16/9) and (min-width: 1920px)');
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));

    // Filter widgets based on current mode
    const visibleWidgets = useMemo(() => {
      return widgets.filter((widget) => {
        // Check if widget should be visible in current mode
        const modeVisibility = widget.visible?.[mode];
        if (modeVisibility === false) return false;

        // Default visibility rules based on priority
        if (mode === "minimal") {
          return widget.priority !== undefined && widget.priority <= 3;
        }
        if (mode === "compact") {
          return widget.priority !== undefined && widget.priority <= 6;
        }

        return true; // detailed and fullscreen show all widgets
      });
    }, [widgets, mode]);

    // Apply layout-specific configurations to widgets
    const layoutOptimizedWidgets = useMemo(() => {
      return getWidgetsForLayout(
        visibleWidgets,
        layout,
        mode,
        isUltrawide,
        isWidescreen
      );
    }, [visibleWidgets, layout, mode, isUltrawide, isWidescreen]);

    // Get spacing based on density and mode
    const getSpacing = useMemo(() => {
      const baseSpacing = {
        minimal: { xs: 1.5, sm: 2, md: 2.5 },
        compact: { xs: 2, sm: 2.5, md: 3 },
        detailed: { xs: 2.5, sm: 3, md: 3.5 },
        fullscreen: { xs: 1, sm: 1.5, md: 2 },
      };

      const densityMultiplier = {
        dense: 0.8,
        compact: 0.9,
        comfortable: 1,
      };

      // Adjust spacing for ultrawide screens
      const screenMultiplier = isUltrawide ? 1.2 : isWidescreen ? 1.1 : 1;

      const modeSpacing = baseSpacing[mode];
      const multiplier = densityMultiplier[density] * screenMultiplier;

      return {
        xs: modeSpacing.xs * multiplier,
        sm: modeSpacing.sm * multiplier,
        md: modeSpacing.md * multiplier,
      };
    }, [mode, density, isUltrawide, isWidescreen]);

    // Loading state
    if (isLoading) {
      return (
        <Box
          className={className}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: isUltrawide ? 500 : 400,
            borderRadius: 3,
            background: alpha(theme.palette.background.paper, 0.5),
            animation: "pulse 1.5s ease-in-out infinite",
            "@keyframes pulse": {
              "0%": { opacity: 0.6 },
              "50%": { opacity: 0.8 },
              "100%": { opacity: 0.6 },
            },
          }}
        >
          {/* Loading skeleton will be rendered by individual layouts */}
        </Box>
      );
    }

    // Render appropriate layout
    const renderLayout = () => {
      const commonProps = {
        mode,
        density,
        widgets: layoutOptimizedWidgets,
        spacing: getSpacing,
        onWidgetClick,
        onLayoutChange,
        // Pass screen size information
        isUltrawide,
        isWidescreen,
        isLargeScreen,
        isMediumScreen,
      };

      switch (layout) {
        case "grid":
          return <GridLayoutRenderer {...commonProps} />;

        case "list":
          return <ListLayoutRenderer {...commonProps} />;

        case "masonry":
          return <MasonryLayoutRenderer {...commonProps} />;

        default:
          return <GridLayoutRenderer {...commonProps} />;
      }
    };

    return (
      <Box
        className={className}
        sx={{
          width: "100%",
          // No borders/shadows at renderer level - let individual widgets handle styling
          background: "transparent",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          
          // Layout-specific container styles
          ...(layout === "masonry" && {
            // Masonry container optimization
            "& .masonry-layout": {
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
            },
          }),
          
          ...(layout === "list" && {
            // Full width for list layout
            maxWidth: "none",
            width: "100%",
            // Two-column layout on ultrawide screens
            ...(isUltrawide && {
              "& .list-container": {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: { sm: 4, md: 5, lg: 6 },
              },
            }),
          }),
          
          ...(layout === "grid" && {
            // Enhanced grid optimizations for different screen sizes
            "& .grid-container": {
              // Auto-fit grid for responsive behavior
              display: "grid",
              gridTemplateColumns: isUltrawide 
                ? "repeat(auto-fit, minmax(280px, 1fr))"
                : isWidescreen 
                ? "repeat(auto-fit, minmax(300px, 1fr))"
                : "repeat(auto-fit, minmax(320px, 1fr))",
              gap: getSpacing.md,
            },
          }),
          
          ...(mode === "fullscreen" && {
            minHeight: "100vh",
            overflow: "auto",
            padding: 0,
            // Optimized for fullscreen viewing
            "& .dashboard-widget": {
              borderRadius: 2,
            },
          }),
        }}
      >
        {renderLayout()}
      </Box>
    );
  }
);

DashboardLayoutRenderer.displayName = "DashboardLayoutRenderer";
