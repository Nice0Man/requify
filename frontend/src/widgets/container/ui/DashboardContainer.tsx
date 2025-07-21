import React, { memo, useEffect, useState } from "react";
import { Box, Container, useMediaQuery } from "@mui/material";
import type { DashboardContainerProps } from "../model/types";
import {
  useDashboardTheme,
  useDashboardStyles,
  useAnimatedContainerStyles,
  useDashboardPerformance,
} from "@/shared/providers/DashboardThemeProvider";
import {
  useDashboardBreakpoints,
  useOptimizedStyles,
} from "@/shared/styles/dashboard-hooks";

/**
 * Optimized Dashboard Container with modern styling system
 *
 * Features:
 * - Design tokens integration
 * - Performance optimized styles
 * - Responsive behavior
 * - Animation system
 * - Reduced render cycles
 */
export const DashboardContainer = memo<DashboardContainerProps>(
  ({
    children,
    className,
    mode = "detailed",
    layout = "grid",
    density = "comfortable",
    isFullscreen = false,
    maxWidth = false, // Don't constrain by default for new layout
    disableGutters = false,
    enableAnimations = true,
  }) => {
    // Theme system
    const { styleSystem } = useDashboardTheme();
    const { isHighPerformanceMode, shouldReduceAnimations } =
      useDashboardPerformance();
    const { isMobile, isTablet } = useDashboardBreakpoints();

    // Optimized styles with memoization
    const containerStyles = useOptimizedStyles(
      () => ({
        // Base container styles
        root: {
          width: "100%",
          minHeight: 0, // Important for flex children
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden", // Prevent layout shifts

          // Background system
          background: styleSystem.colors.background,

          // Spacing system using design tokens
          padding: disableGutters
            ? 0
            : {
                xs: styleSystem.spacing.xs,
                sm: styleSystem.spacing.sm,
                md: styleSystem.spacing.md,
              },

          // Responsive behavior
          ...(isMobile && {
            padding: disableGutters ? 0 : styleSystem.spacing.xs,
          }),

          // Fullscreen optimizations
          ...(isFullscreen && {
            padding: 0,
            background: styleSystem.colors.text.primary,
            overflow: "auto",

            // Performance optimizations for fullscreen
            willChange: "auto",
            transform: "translateZ(0)", // Force GPU acceleration
          }),

          // High performance mode optimizations
          ...(isHighPerformanceMode && {
            padding: disableGutters ? 0 : styleSystem.spacing.xs,
            background: "transparent",
          }),

          // Layout-specific optimizations
          ...(layout === "masonry" && {
            overflow: "visible", // Allow masonry to flow naturally
          }),

          // Animation styles
          ...(!shouldReduceAnimations &&
            enableAnimations && {
              transition: `all ${styleSystem.animations.fadeIn} ease-out`,
              ...styleSystem.animations.fadeIn,
            }),
        },

        // Inner content wrapper
        content: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minHeight: 0,

          // Layout-specific content styles
          ...(layout === "grid" && {
            gap: styleSystem.spacing.md,
          }),

          ...(layout === "masonry" && {
            gap: styleSystem.spacing.sm,
          }),

          ...(layout === "list" && {
            gap: styleSystem.spacing.sm,
          }),
        },
      }),
      [
        styleSystem,
        disableGutters,
        isMobile,
        isFullscreen,
        isHighPerformanceMode,
        layout,
        shouldReduceAnimations,
        enableAnimations,
      ]
    );

    // Performance tracking
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      // Delayed mounting to prevent layout shifts
      const timer = setTimeout(() => setIsMounted(true), 50);
      return () => clearTimeout(timer);
    }, []);

    // Animated container styles
    const animatedStyles = useAnimatedContainerStyles();

    // Responsive maxWidth handling
    const responsiveMaxWidth =
      maxWidth === false
        ? false
        : isFullscreen
        ? false
        : isMobile
        ? "sm"
        : isTablet
        ? "md"
        : maxWidth || "xl";

    if (!isMounted) {
      // Minimal loading state to prevent flashes
      return (
        <Box
          sx={{
            width: "100%",
            minHeight: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.7,
          }}
        />
      );
    }

    return (
      <Container
        className={className}
        maxWidth={responsiveMaxWidth}
        disableGutters={disableGutters}
        sx={containerStyles.root}
      >
        <Box
          sx={{
            ...containerStyles.content,
            // Apply animations if enabled
            ...(!shouldReduceAnimations &&
              enableAnimations &&
              animatedStyles("fadeIn")),
          }}
        >
          {children}
        </Box>
      </Container>
    );
  }
);
