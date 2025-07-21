import React, { memo, useMemo, useEffect, useState } from "react";
import {
  Box,
  Container,
  Stack,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";

export type DashboardMode = "minimal" | "compact" | "detailed" | "fullscreen";
export type DashboardLayout = "grid" | "list" | "masonry";
export type DashboardDensity = "comfortable" | "compact" | "dense";

interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
  mode?: DashboardMode;
  layout?: DashboardLayout;
  density?: DashboardDensity;
  isFullscreen?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
}

export const DashboardContainer = memo<DashboardContainerProps>(
  ({
    children,
    className,
    mode = "detailed",
    layout = "grid",
    density = "comfortable",
    isFullscreen = false,
    maxWidth = "xl",
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [isMounted, setIsMounted] = useState(false);

    // Handle mounting safely
    useEffect(() => {
      const timer = setTimeout(() => setIsMounted(true), 200);
      return () => clearTimeout(timer);
    }, []);

    // Context7 spacing system
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

      const modeSpacing = baseSpacing[mode];
      const multiplier = densityMultiplier[density];

      return {
        xs: modeSpacing.xs * multiplier,
        sm: modeSpacing.sm * multiplier,
        md: modeSpacing.md * multiplier,
      };
    }, [mode, density]);

    // Context7 padding system
    const getPadding = useMemo(() => {
      if (isFullscreen) return { xs: 1, sm: 1.5, md: 2 };

      const basePadding = {
        minimal: { xs: 2, sm: 3, md: 3 },
        compact: { xs: 2, sm: 3, md: 3.5 },
        detailed: { xs: 2.5, sm: 3.5, md: 4 },
        fullscreen: { xs: 1, sm: 1.5, md: 2 },
      };

      return basePadding[mode];
    }, [mode, isFullscreen]);

    // Show basic version before mounting to prevent transition errors
    if (!isMounted) {
      return (
        <Box
          className={className}
          sx={{
            flex: 1,
            background: "transparent",
            position: "relative",
            opacity: 0.8,
          }}
        >
          <Container maxWidth={maxWidth} sx={{ py: 3, px: 3 }}>
            <Stack spacing={3}>{children}</Stack>
          </Container>
        </Box>
      );
    }

    return (
      <Box
        className={className}
        sx={{
          flex: 1,
          background: isFullscreen
            ? theme.palette.background.default
            : "transparent",
          position: "relative",
          transition: "background-color 0.3s ease",
        }}
      >
        <Container
          maxWidth={isFullscreen ? false : maxWidth}
          disableGutters={isFullscreen}
          sx={{
            py: getPadding,
            px: getPadding,
            height: isFullscreen ? "100vh" : "auto",
            minHeight: isFullscreen ? "100vh" : "auto",
            overflow: isFullscreen ? "auto" : "visible",
            scrollBehavior: "smooth",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            // Enhanced scrollbar styling
            "&::-webkit-scrollbar": {
              width: isFullscreen ? 12 : 8,
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: alpha(theme.palette.divider, 0.05),
              borderRadius: isFullscreen ? 6 : 4,
              margin: isFullscreen ? 4 : 2,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: isFullscreen ? 6 : 4,
              border: isFullscreen
                ? `2px solid ${theme.palette.background.default}`
                : "none",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.3),
              },
            },
            // Layout-specific adjustments
            ...(layout === "masonry" && {
              // Remove CSS columns conflicts - masonry handled by MasonryLayoutRenderer
              overflow: "hidden",
              "& .masonry-layout": {
                width: "100%",
                maxWidth: "100%",
              },
            }),
          }}
        >
          {/* Enhanced Content Container */}
          {layout === "masonry" ? (
            // Masonry Layout - Handled by MasonryLayoutRenderer
            <Box
              className="masonry-layout"
              sx={{
                animation: "slideUp 0.4s ease-out",
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
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                // Let MasonryLayoutRenderer handle all layout logic
              }}
            >
              {children}
            </Box>
          ) : (
            // Standard Stack Layout for Grid and List
            <Stack
              direction={
                layout === "list" && mode === "minimal" ? "row" : "column"
              }
              spacing={getSpacing}
              flexWrap={
                layout === "list" && mode === "minimal" ? "wrap" : "nowrap"
              }
              sx={{
                animation: "slideUp 0.4s ease-out",
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
                // Enhanced transitions
                "& > *": {
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transformOrigin: "center top",
                  // Layout-specific adjustments
                  ...(layout === "list" && {
                    "&:hover": {
                      transform:
                        mode === "fullscreen"
                          ? "translateX(2px)"
                          : "translateX(4px) translateZ(0)",
                    },
                  }),
                  ...(layout === "grid" && {
                    "&:hover": {
                      transform:
                        mode === "fullscreen"
                          ? "translateY(-1px)"
                          : "translateY(-2px) translateZ(0)",
                    },
                  }),
                },
                // List layout specific styles
                ...(layout === "list" && {
                  "& > *": {
                    width: "100%",
                    ...(mode === "minimal" && {
                      minWidth: {
                        xs: "100%",
                        sm: "calc(50% - 8px)",
                        md: "calc(33.333% - 12px)",
                      },
                    }),
                  },
                }),
                // Grid layout optimizations - адаптивные колонки для контента
                ...(layout === "grid" && {
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(auto-fit, minmax(400px, 1fr))",
                    md: "repeat(auto-fit, minmax(450px, 1fr))",
                    lg: "repeat(auto-fit, minmax(500px, 1fr))",
                    xl: "repeat(auto-fit, minmax(550px, 1fr))",
                  },
                  gap: {
                    xs: getSpacing.xs,
                    sm: getSpacing.sm,
                    md: getSpacing.md,
                  },
                  // Адаптивное поведение для виджетов
                  "& > *": {
                    // Большие виджеты занимают 2 ячейки сетки при возможности
                    "&[data-large='true']": {
                      gridColumn: {
                        sm: "span 2",
                        md: "span 2",
                        lg: "span 1",
                        xl: "span 1",
                      },
                    },
                    // Маленькие виджеты занимают 1 ячейку
                    "&[data-small='true']": {
                      gridColumn: "span 1",
                    },
                  },
                }),
              }}
            >
              {children}
            </Stack>
          )}
        </Container>
      </Box>
    );
  }
);

DashboardContainer.displayName = "DashboardContainer";
