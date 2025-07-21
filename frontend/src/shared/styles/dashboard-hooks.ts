import { useMemo } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import type { Theme, SxProps } from "@mui/material/styles";
import {
  DASHBOARD_TOKENS,
  type DashboardMode,
  type DashboardLayout,
  type DashboardDensity,
  type WidgetSize,
  getSpacingForMode,
  getWidgetPadding,
  getShadowForState,
  getAnimationDuration,
  getStaggerDelay,
} from "./dashboard-tokens";

// Мемоизированный хук для spacing системы
export const useDashboardSpacing = (
  mode: DashboardMode,
  density: DashboardDensity,
  layout?: DashboardLayout
) => {
  return useMemo(() => {
    const effectiveDensity = mode === "fullscreen" ? "compact" : density;

    return {
      xs: getSpacingForMode(mode, effectiveDensity, "xs"),
      sm: getSpacingForMode(mode, effectiveDensity, "sm"),
      md: getSpacingForMode(mode, effectiveDensity, "md"),
      lg: getSpacingForMode(mode, effectiveDensity, "lg"),
      // Адаптивные отступы для разных layout
      container:
        layout === "masonry"
          ? { xs: 1.5, sm: 2, md: 2.5 }
          : { xs: 2, sm: 2.5, md: 3 },
    };
  }, [mode, density, layout]);
};

// Хук для стилей виджетов с оптимизацией
export const useWidgetStyles = (
  mode: DashboardMode,
  density: DashboardDensity,
  size: WidgetSize = "medium",
  isHovered = false,
  isFocused = false
): SxProps<Theme> => {
  const theme = useTheme();

  return useMemo(() => {
    const padding = getWidgetPadding(density);
    const shadow = getShadowForState(
      isFocused ? "focused" : isHovered ? "hover" : "rest"
    );
    const borderRadius =
      mode === "fullscreen"
        ? DASHBOARD_TOKENS.layout.widget.borderRadius.fullscreen
        : DASHBOARD_TOKENS.layout.widget.borderRadius.normal;

    return {
      padding: `${padding}px`,
      borderRadius: `${borderRadius}px`,
      boxShadow: shadow,
      backgroundColor: DASHBOARD_TOKENS.colors.surface.card,
      backdropFilter: "blur(8px)",
      border: `1px solid ${theme.palette.divider}`,
      transition: `all ${getAnimationDuration("standard")}ms ${
        DASHBOARD_TOKENS.animation.easing.standard
      }`,

      // Размеры виджета
      ...(size !== "auto" && {
        minWidth: DASHBOARD_TOKENS.widget.sizes[size]?.width,
        minHeight: DASHBOARD_TOKENS.widget.sizes[size]?.height,
      }),

      // Оптимизация для fullscreen режима
      ...(mode === "fullscreen" && {
        boxShadow: DASHBOARD_TOKENS.shadows.container.flat,
        borderRadius: `${DASHBOARD_TOKENS.layout.widget.borderRadius.fullscreen}px`,
      }),

      // Hover и focus states
      "&:hover": {
        transform: mode === "fullscreen" ? "none" : "translateY(-2px)",
        boxShadow: getShadowForState("hover"),
      },

      "&:focus-within": {
        boxShadow: getShadowForState("focused"),
        outline: "none",
      },
    };
  }, [theme, mode, density, size, isHovered, isFocused]);
};

// Responsive hooks с мемоизацией
export const useDashboardBreakpoints = () => {
  const theme = useTheme();

  return useMemo(
    () => ({
      isMobile: useMediaQuery(theme.breakpoints.down("sm")),
      isTablet: useMediaQuery(theme.breakpoints.between("sm", "md")),
      isDesktop: useMediaQuery(theme.breakpoints.up("lg")),
      isWide: useMediaQuery(
        `(min-width: ${DASHBOARD_TOKENS.breakpoints.wide}px)`
      ),
      isUltrawide: useMediaQuery(
        `(min-width: ${DASHBOARD_TOKENS.breakpoints.ultrawide}px)`
      ),
    }),
    [theme]
  );
};

// Хук для анимаций с performance оптимизацией
export const useDashboardAnimations = (
  enabled = true,
  reducedMotion = false
) => {
  return useMemo(() => {
    if (!enabled || reducedMotion) {
      return {
        fadeIn: {},
        slideUp: {},
        staggerContainer: {},
        staggerItem: () => ({}),
      };
    }

    return {
      // Fade in animation
      fadeIn: {
        animation: `fadeIn ${getAnimationDuration("standard")}ms ${
          DASHBOARD_TOKENS.animation.easing.decelerated
        }`,
        "@keyframes fadeIn": {
          "0%": { opacity: 0, transform: "scale(0.98)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },

      // Slide up animation
      slideUp: {
        animation: `slideUp ${getAnimationDuration("standard")}ms ${
          DASHBOARD_TOKENS.animation.easing.standard
        }`,
        "@keyframes slideUp": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },

      // Stagger container
      staggerContainer: {
        "& > *": {
          animation: `staggerItem ${getAnimationDuration("standard")}ms ${
            DASHBOARD_TOKENS.animation.easing.decelerated
          } both`,
        },
        "& > *:nth-of-type(1)": { animationDelay: `${getStaggerDelay(0)}ms` },
        "& > *:nth-of-type(2)": { animationDelay: `${getStaggerDelay(1)}ms` },
        "& > *:nth-of-type(3)": { animationDelay: `${getStaggerDelay(2)}ms` },
        "& > *:nth-of-type(4)": { animationDelay: `${getStaggerDelay(3)}ms` },
        "& > *:nth-of-type(5)": { animationDelay: `${getStaggerDelay(4)}ms` },
        "& > *:nth-of-type(n+6)": { animationDelay: `${getStaggerDelay(5)}ms` },
        "@keyframes staggerItem": {
          "0%": { opacity: 0, transform: "translateY(20px) scale(0.95)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
      },

      // Dynamic stagger item
      staggerItem: (
        index: number,
        speed: "fast" | "normal" | "slow" = "normal"
      ) => ({
        animation: `staggerItem ${getAnimationDuration("standard")}ms ${
          DASHBOARD_TOKENS.animation.easing.decelerated
        } both`,
        animationDelay: `${getStaggerDelay(index, speed)}ms`,
      }),
    };
  }, [enabled, reducedMotion]);
};

// Хук для layout стилей
export const useLayoutStyles = (
  mode: DashboardMode,
  layout: DashboardLayout,
  density: DashboardDensity
): SxProps<Theme> => {
  const spacing = useDashboardSpacing(mode, density, layout);
  const { isUltrawide, isWide, isMobile } = useDashboardBreakpoints();

  return useMemo(() => {
    const baseStyles: SxProps<Theme> = {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: spacing.md,
      transition: `all ${getAnimationDuration("standard")}ms ${
        DASHBOARD_TOKENS.animation.easing.standard
      }`,
    };

    // Layout-specific optimizations
    switch (layout) {
      case "grid":
        return {
          ...baseStyles,
          "& .grid-container": {
            display: "grid",
            gap: spacing.md,
            gridTemplateColumns: isUltrawide
              ? "repeat(auto-fit, minmax(300px, 1fr))"
              : isWide
              ? "repeat(auto-fit, minmax(280px, 1fr))"
              : "repeat(auto-fit, minmax(260px, 1fr))",
          },
        };

      case "masonry":
        return {
          ...baseStyles,
          "& .masonry-container": {
            columnCount: isUltrawide ? 4 : isWide ? 3 : isMobile ? 1 : 2,
            columnGap: spacing.md,
            "& > *": {
              breakInside: "avoid",
              marginBottom: spacing.md,
            },
          },
        };

      case "list":
        return {
          ...baseStyles,
          "& .list-container": {
            display: "flex",
            flexDirection: "column",
            gap: spacing.sm,
            ...(isUltrawide && {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: spacing.lg,
            }),
          },
        };

      default:
        return baseStyles;
    }
  }, [mode, layout, density, spacing, isUltrawide, isWide, isMobile]);
};

// Хук для цветовой схемы dashboard
export const useDashboardColors = (mode: DashboardMode) => {
  const theme = useTheme();

  return useMemo(
    () => ({
      // Semantic colors
      primary: DASHBOARD_TOKENS.colors.dashboard.primary,
      secondary: DASHBOARD_TOKENS.colors.dashboard.secondary,
      success: DASHBOARD_TOKENS.colors.dashboard.success,
      warning: DASHBOARD_TOKENS.colors.dashboard.warning,
      error: DASHBOARD_TOKENS.colors.dashboard.error,
      info: DASHBOARD_TOKENS.colors.dashboard.info,

      // Surface colors
      surface: {
        elevated: DASHBOARD_TOKENS.colors.surface.elevated,
        card: DASHBOARD_TOKENS.colors.surface.card,
        overlay: DASHBOARD_TOKENS.colors.surface.overlay,
        glass: DASHBOARD_TOKENS.colors.surface.glass,
      },

      // Context-aware text colors
      text: {
        primary:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.87)"
            : DASHBOARD_TOKENS.colors.text.primary,
        secondary:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.6)"
            : DASHBOARD_TOKENS.colors.text.secondary,
        disabled:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.38)"
            : DASHBOARD_TOKENS.colors.text.disabled,
      },

      // Background for different modes
      background:
        mode === "fullscreen"
          ? theme.palette.background.default
          : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
    }),
    [theme, mode]
  );
};

// Utility hook для создания оптимизированных стилей
export const useOptimizedStyles = <T extends Record<string, SxProps<Theme>>>(
  stylesFactory: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(stylesFactory, dependencies);
};

// Хук для adaptive sizing
export const useAdaptiveSizing = (
  mode: DashboardMode,
  density: DashboardDensity,
  baseSize: WidgetSize = "medium"
) => {
  const { isMobile, isTablet } = useDashboardBreakpoints();

  return useMemo(() => {
    // Автоматическое уменьшение размеров на мобильных устройствах
    if (isMobile) {
      return mode === "minimal" ? "small" : "medium";
    }

    if (isTablet) {
      return baseSize === "xlarge" ? "large" : baseSize;
    }

    // Fullscreen режим увеличивает размеры
    if (mode === "fullscreen") {
      const sizeMap = {
        small: "medium",
        medium: "large",
        large: "xlarge",
        xlarge: "xlarge",
        auto: "auto",
      };
      return sizeMap[baseSize] || baseSize;
    }

    return baseSize;
  }, [mode, density, baseSize, isMobile, isTablet]);
};

// Master hook для всех dashboard стилей
export const useDashboardStyleSystem = (
  mode: DashboardMode,
  layout: DashboardLayout,
  density: DashboardDensity,
  options: {
    enableAnimations?: boolean;
    reducedMotion?: boolean;
    size?: WidgetSize;
  } = {}
) => {
  const {
    enableAnimations = true,
    reducedMotion = false,
    size = "medium",
  } = options;

  const spacing = useDashboardSpacing(mode, density, layout);
  const breakpoints = useDashboardBreakpoints();
  const animations = useDashboardAnimations(enableAnimations, reducedMotion);
  const layoutStyles = useLayoutStyles(mode, layout, density);
  const colors = useDashboardColors(mode);
  const adaptiveSize = useAdaptiveSizing(mode, density, size);

  const widgetStyles = useWidgetStyles(
    mode,
    density,
    adaptiveSize as WidgetSize
  );

  return useMemo(
    () => ({
      spacing,
      breakpoints,
      animations,
      layoutStyles,
      colors,
      widgetStyles,
      adaptiveSize,
      // Utility functions
      getWidgetStyles: (overrides?: SxProps<Theme>) => ({
        ...widgetStyles,
        ...overrides,
      }),
      getAnimatedStyles: (animationType: keyof typeof animations) => ({
        ...animations[animationType],
      }),
    }),
    [
      spacing,
      breakpoints,
      animations,
      layoutStyles,
      colors,
      widgetStyles,
      adaptiveSize,
    ]
  );
};
