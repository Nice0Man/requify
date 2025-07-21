import React, { memo, useMemo } from "react";
import {
  Box,
  Stack,
  useTheme,
  alpha,
  Skeleton,
  Divider,
  useMediaQuery,
} from "@mui/material";
import type { DashboardMode, DashboardDensity } from "@/shared/types/dashboard";
import type { DashboardWidget } from "./DashboardLayoutRenderer";

interface ListLayoutRendererProps {
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

export const ListLayoutRenderer = memo<ListLayoutRendererProps>(
  ({ mode, density, widgets, spacing, onWidgetClick }) => {
    const theme = useTheme();

    // Detect ultrawide screens (21:9 aspect ratio or wider)
    const isUltrawide = useMediaQuery(
      "(min-aspect-ratio: 21/9) and (min-width: 2560px)"
    );
    const isWidescreen = useMediaQuery(
      "(min-aspect-ratio: 16/9) and (min-width: 1920px)"
    );

    // Sort widgets by priority for optimal ordering
    const sortedWidgets = useMemo(() => {
      return [...widgets].sort((a, b) => {
        const priorityA = a.priority || 999;
        const priorityB = b.priority || 999;
        return priorityA - priorityB;
      });
    }, [widgets]);

    // Split widgets into columns for ultrawide screens
    const { leftColumnWidgets, rightColumnWidgets } = useMemo(() => {
      if (!isUltrawide || mode === "minimal") {
        return { leftColumnWidgets: sortedWidgets, rightColumnWidgets: [] };
      }

      const mid = Math.ceil(sortedWidgets.length / 2);
      return {
        leftColumnWidgets: sortedWidgets.slice(0, mid),
        rightColumnWidgets: sortedWidgets.slice(mid),
      };
    }, [sortedWidgets, isUltrawide, mode]);

    // Get responsive list configuration
    const getListConfig = () => {
      return {
        width: "100%",
        maxWidth: "none", // Full width for list layout
        margin: 0,
        px: {
          xs: 0,
          sm: isUltrawide ? 2 : 0,
          md: isUltrawide ? 3 : 0,
        },
      };
    };

    // Get spacing between list items
    const getItemSpacing = () => {
      const base = mode === "minimal" ? 2 : mode === "compact" ? 2.5 : 3;
      const densityMultiplier =
        density === "dense" ? 0.8 : density === "compact" ? 0.9 : 1;
      return base * densityMultiplier;
    };

    // Get item height based on mode and density
    const getItemHeight = (widget: DashboardWidget) => {
      const baseHeight = {
        minimal: 120,
        compact: 160,
        detailed: 200,
        fullscreen: 180,
      };

      const densityMultiplier = {
        dense: 0.8,
        compact: 0.9,
        comfortable: 1,
      };

      return baseHeight[mode] * densityMultiplier[density];
    };

    // Loading skeleton for list layout
    const renderLoadingSkeleton = () => {
      const skeletonCount =
        mode === "minimal" ? 8 : mode === "compact" ? 10 : 12;

      return (
        <Stack spacing={getItemSpacing()} sx={getListConfig()}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Box
              key={`skeleton-${index}`}
              sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: 3,
                background: alpha(theme.palette.background.paper, 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                height: mode === "minimal" ? 100 : 160,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Skeleton
                variant="rectangular"
                width={80}
                height={60}
                sx={{
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={24}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={16}
                  sx={{ mb: 1 }}
                />
                <Skeleton variant="text" width="80%" height={14} />
              </Box>
            </Box>
          ))}
        </Stack>
      );
    };

    // Render single column of widgets
    const renderWidgetColumn = (
      columnWidgets: DashboardWidget[],
      startIndex = 0
    ) => (
      <Stack spacing={getItemSpacing()}>
        {columnWidgets.map((widget, index) => {
          const WidgetComponent = widget.component;
          const itemHeight = getItemHeight(widget);
          const globalIndex = startIndex + index;

          return (
            <React.Fragment key={widget.id}>
              <Box
                className="list-item"
                sx={{
                  // Animation delays for staggered entrance
                  animation: `slideInLeft 0.6s ease-out ${
                    globalIndex * 0.05
                  }s both`,
                  "@keyframes slideInLeft": {
                    "0%": {
                      opacity: 0,
                      transform: "translateX(-30px) scale(0.95)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateX(0) scale(1)",
                    },
                  },
                }}
              >
                <Box
                  className="dashboard-widget"
                  onClick={() => onWidgetClick?.(widget.id)}
                  sx={{
                    width: "100%",
                    minHeight: mode === "minimal" ? "auto" : itemHeight,
                    cursor: onWidgetClick ? "pointer" : "default",
                    background: "transparent",
                    borderRadius: mode === "fullscreen" ? 2 : 3,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    p: 0,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform:
                        mode === "fullscreen" ? "none" : "translateY(-1px)",
                      zIndex: 1,
                    },
                  }}
                >
                  <WidgetComponent
                    {...widget.props}
                    mode={mode}
                    density={density}
                    layout="list"
                    compact={mode === "minimal"}
                    fullWidth={true}
                    ultrawide={isUltrawide}
                  />
                </Box>
              </Box>

              {/* Add divider between items in detailed mode */}
              {mode === "detailed" && index < columnWidgets.length - 1 && (
                <Divider
                  sx={{
                    opacity: 0.3,
                    borderColor: alpha(theme.palette.divider, 0.1),
                    my: 0.5,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Stack>
    );

    if (widgets.length === 0) {
      return renderLoadingSkeleton();
    }

    return (
      <Box sx={getListConfig()}>
        {isUltrawide && rightColumnWidgets.length > 0 ? (
          // Two-column layout for ultrawide screens
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: {
                sm: 4,
                md: 5,
                lg: 6,
              },
              alignItems: "start",
              animation: "fadeInScale 0.8s ease-out",
              "@keyframes fadeInScale": {
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
            {/* Left Column */}
            <Box sx={{ minHeight: 0 }}>
              {renderWidgetColumn(leftColumnWidgets, 0)}
            </Box>

            {/* Vertical Divider */}
            <Box
              sx={{
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: "-12px",
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: `linear-gradient(180deg, 
                    transparent 0%, 
                    ${alpha(theme.palette.divider, 0.2)} 20%, 
                    ${alpha(theme.palette.divider, 0.4)} 50%, 
                    ${alpha(theme.palette.divider, 0.2)} 80%, 
                    transparent 100%)`,
                  animation: "glow 3s ease-in-out infinite",
                  "@keyframes glow": {
                    "0%, 100%": { opacity: 0.5 },
                    "50%": { opacity: 1 },
                  },
                },
              }}
            >
              {/* Right Column */}
              {renderWidgetColumn(rightColumnWidgets, leftColumnWidgets.length)}
            </Box>
          </Box>
        ) : (
          // Single column layout for normal screens
          <Box
            sx={{
              animation: "slideUp 0.6s ease-out",
              "@keyframes slideUp": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(20px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            {renderWidgetColumn(sortedWidgets)}
          </Box>
        )}
      </Box>
    );
  }
);

ListLayoutRenderer.displayName = "ListLayoutRenderer";
