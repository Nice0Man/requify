import { alpha, Theme, useTheme } from "@mui/material/styles";
import type { SxProps } from "@mui/material";
import type {
  DashboardMode,
  DashboardLayoutType,
  DashboardDensity,
} from "@/shared/types/dashboard";

/**
 * Размеры виджетов
 */
export type WidgetSize = "small" | "medium" | "large" | "xl";

/**
 * Варианты виджетов
 */
export type WidgetVariant = "default" | "elevated" | "outlined" | "filled";

/**
 * Состояния виджетов
 */
export type WidgetState =
  | "default"
  | "loading"
  | "error"
  | "empty"
  | "disabled";

/**
 * Конфигурация стилей виджета
 */
export interface WidgetStyleConfig {
  mode: DashboardMode;
  layout: DashboardLayoutType;
  density: DashboardDensity;
  size?: WidgetSize;
  variant?: WidgetVariant;
  state?: WidgetState;
  interactive?: boolean;
  collapsible?: boolean;
  resizable?: boolean;
}

/**
 * Context7-совместимые токены дизайна с улучшенной производительностью
 */
export const WIDGET_DESIGN_TOKENS = {
  // Spacing - оптимизированные значения для предотвращения layout shift
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },

  // Border radius - современные значения
  borderRadius: {
    none: 0,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    full: "50%",
  },

  // Shadows - оптимизированные для производительности
  shadows: {
    none: "none",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  },

  // Z-index - улучшенная иерархия
  zIndex: {
    widget: 1,
    widgetHeader: 10,
    widgetOverlay: 20,
    widgetModal: 30,
    widgetTooltip: 40,
    widgetFab: 50,
  },

  // Transitions - оптимизированные для плавности
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "350ms cubic-bezier(0.4, 0, 0.2, 1)",
    bouncy: "400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  // Typography - улучшенная иерархия
  typography: {
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      xxl: "1.5rem",
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Context7: Breakpoints для responsive design
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },

  // Context7: Optimized layout constants
  layout: {
    containerMaxWidth: {
      xs: "100%",
      sm: "600px",
      md: "960px",
      lg: "1280px",
      xl: "1920px",
    },
    // Предотвращение layout shift
    minWidgetHeight: {
      small: 120,
      medium: 200,
      large: 300,
      xl: 400,
    },
  },
} as const;

/**
 * Context7: Получить размеры виджета в зависимости от режима и плотности
 * Оптимизировано для предотвращения layout shift
 */
export const getWidgetSizing = (config: WidgetStyleConfig) => {
  const { mode, density, size = "medium" } = config;

  const baseSizes = {
    small: { 
      minHeight: WIDGET_DESIGN_TOKENS.layout.minWidgetHeight.small, 
      padding: WIDGET_DESIGN_TOKENS.spacing.sm,
      aspectRatio: "16/9" as const,
    },
    medium: { 
      minHeight: WIDGET_DESIGN_TOKENS.layout.minWidgetHeight.medium, 
      padding: WIDGET_DESIGN_TOKENS.spacing.md,
      aspectRatio: "4/3" as const,
    },
    large: { 
      minHeight: WIDGET_DESIGN_TOKENS.layout.minWidgetHeight.large, 
      padding: WIDGET_DESIGN_TOKENS.spacing.lg,
      aspectRatio: "3/2" as const,
    },
    xl: { 
      minHeight: WIDGET_DESIGN_TOKENS.layout.minWidgetHeight.xl, 
      padding: WIDGET_DESIGN_TOKENS.spacing.xl,
      aspectRatio: "21/9" as const,
    },
  };

  const modeMultipliers = {
    minimal: 0.8,
    compact: 0.9,
    detailed: 1,
    fullscreen: 1.2,
    overview: 0.95,
  };

  const densityMultipliers = {
    dense: 0.8,
    compact: 0.9,
    comfortable: 1,
    spacious: 1.1,
  };

  const baseSize = baseSizes[size];
  const modeMultiplier = modeMultipliers[mode];
  const densityMultiplier = densityMultipliers[density];

  return {
    minHeight: Math.round(
      baseSize.minHeight * modeMultiplier * densityMultiplier
    ),
    padding: Math.round(baseSize.padding * densityMultiplier),
    aspectRatio: baseSize.aspectRatio,
  };
};

/**
 * Context7: Получить стили для варианта виджета с GPU acceleration
 */
export const getWidgetVariantStyles = (
  variant: WidgetVariant,
  theme: Theme
): SxProps<Theme> => {
  const baseStyles: SxProps<Theme> = {
    borderRadius: WIDGET_DESIGN_TOKENS.borderRadius.lg,
    transition: WIDGET_DESIGN_TOKENS.transitions.normal,
    overflow: "hidden",
    // Context7: GPU acceleration для плавных анимаций
    willChange: "transform, box-shadow",
    backfaceVisibility: "hidden",
    transform: "translateZ(0)",
  };

  switch (variant) {
    case "elevated":
      return {
        ...baseStyles,
        bgcolor: "background.paper",
        boxShadow: WIDGET_DESIGN_TOKENS.shadows.lg,
        border: "none",
        "&:hover": {
          boxShadow: WIDGET_DESIGN_TOKENS.shadows.xl,
          transform: "translateY(-2px) translateZ(0)",
        },
      };

    case "outlined":
      return {
        ...baseStyles,
        bgcolor: "background.paper",
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
        "&:hover": {
          borderColor: theme.palette.primary.main,
          boxShadow: WIDGET_DESIGN_TOKENS.shadows.md,
        },
      };

    case "filled":
      return {
        ...baseStyles,
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        boxShadow: "none",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          borderColor: alpha(theme.palette.primary.main, 0.2),
        },
      };

    default: // 'default'
      return {
        ...baseStyles,
        bgcolor: "background.paper",
        boxShadow: WIDGET_DESIGN_TOKENS.shadows.md,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        "&:hover": {
          boxShadow: WIDGET_DESIGN_TOKENS.shadows.lg,
        },
      };
  }
};

/**
 * Context7: Получить стили для состояния виджета
 */
export const getWidgetStateStyles = (
  state: WidgetState,
  theme: Theme
): SxProps<Theme> => {
  switch (state) {
    case "loading":
      return {
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          zIndex: WIDGET_DESIGN_TOKENS.zIndex.widgetOverlay,
          backdropFilter: "blur(2px)",
        },
      };

    case "error":
      return {
        borderColor: theme.palette.error.main,
        bgcolor: alpha(theme.palette.error.main, 0.05),
        "& .widget-header": {
          color: theme.palette.error.main,
        },
      };

    case "empty":
      return {
        opacity: 0.6,
        "& .widget-content": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 120,
        },
      };

    case "disabled":
      return {
        opacity: 0.5,
        pointerEvents: "none",
        filter: "grayscale(50%)",
      };

    default:
      return {};
  }
};

/**
 * Context7: Получить стили для интерактивного виджета с оптимизацией
 */
export const getInteractiveWidgetStyles = (
  interactive: boolean,
  theme: Theme
): SxProps<Theme> => {
  if (!interactive) return {};

  return {
    cursor: "pointer",
    transition: `all ${WIDGET_DESIGN_TOKENS.transitions.normal}`,
    // Context7: Optimized hover effects
    "&:hover": {
      transform: "translateY(-2px) scale(1.02) translateZ(0)",
      boxShadow: WIDGET_DESIGN_TOKENS.shadows.xl,
    },

    "&:active": {
      transform: "translateY(0) scale(1) translateZ(0)",
      boxShadow: WIDGET_DESIGN_TOKENS.shadows.md,
    },

    "&:focus-visible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },

    // Context7: Touch device optimizations
    "@media (hover: none)": {
      "&:hover": {
        transform: "none",
        boxShadow: WIDGET_DESIGN_TOKENS.shadows.md,
      },
    },
  };
};

/**
 * Context7: Получить стили для layout'а виджета с CSS Grid оптимизацией
 */
export const getWidgetLayoutStyles = (
  layout: DashboardLayoutType,
  theme: Theme
): SxProps<Theme> => {
  switch (layout) {
    case "list":
      return {
        width: "100%",
        "& .widget-content": {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: WIDGET_DESIGN_TOKENS.spacing.md,
        },
      };

    case "masonry":
      return {
        breakInside: "avoid",
        pageBreakInside: "avoid",
        // Context7: Optimized masonry layout
        containIntrinsicSize: "320px auto",
        contentVisibility: "auto",
        "& .widget-content": {
          display: "flex",
          flexDirection: "column",
        },
      };

    default: // 'grid'
      return {
        display: "flex",
        flexDirection: "column",
        height: "fit-content",
        // Context7: Optimized grid layout
        containIntrinsicSize: "auto 200px",
        contentVisibility: "auto",
      };
  }
};

/**
 * Context7: Главная функция для получения стилей виджета
 * Оптимизировано для производительности и предотвращения layout shift
 */
export const createWidgetStyles = (
  config: WidgetStyleConfig,
  theme: Theme
): SxProps<Theme> => {
  const {
    variant = "default",
    state = "default",
    interactive = false,
    layout = "grid",
  } = config;

  const sizing = getWidgetSizing(config);
  const variantStyles = getWidgetVariantStyles(variant, theme);
  const stateStyles = getWidgetStateStyles(state, theme);
  const interactiveStyles = getInteractiveWidgetStyles(interactive, theme);
  const layoutStyles = getWidgetLayoutStyles(layout, theme);

  // Context7: Базовые стили с оптимизацией производительности
  const baseStyles: SxProps<Theme> = {
    minHeight: sizing.minHeight,
    // Context7: Предотвращение layout shift
    aspectRatio: sizing.aspectRatio,
    
    // Внутренний padding
    "& .widget-content": {
      p: sizing.padding / 8, // конвертируем в theme spacing units
    },

    // Заголовок виджета
    "& .widget-header": {
      pb: sizing.padding / 16,
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      mb: sizing.padding / 16,
    },

    // Context7: Оптимизированные анимации
    "& .widget-enter": {
      opacity: 0,
      transform: "translateY(20px) translateZ(0)",
    },

    "& .widget-enter-active": {
      opacity: 1,
      transform: "translateY(0) translateZ(0)",
      transition: `all ${WIDGET_DESIGN_TOKENS.transitions.normal}`,
    },

    // Context7: Responsive с container queries support
    "@container (max-width: 480px)": {
      minHeight: sizing.minHeight * 0.8,
      "& .widget-content": {
        p: (sizing.padding * 0.8) / 8,
      },
    },

    // Context7: Fallback для старых браузеров
    [theme.breakpoints.down("md")]: {
      minHeight: sizing.minHeight * 0.8,
      "& .widget-content": {
        p: (sizing.padding * 0.8) / 8,
      },
    },

    // Context7: Performance optimizations
    contain: "layout style paint",
    isolation: "isolate",
  };

  // Объединение стилей с правильной типизацией
  const combinedStyles: SxProps<Theme> = (theme: Theme) => ({
    ...baseStyles,
    ...(typeof variantStyles === "function"
      ? variantStyles(theme)
      : variantStyles),
    ...(typeof stateStyles === "function" ? stateStyles(theme) : stateStyles),
    ...(typeof interactiveStyles === "function"
      ? interactiveStyles(theme)
      : interactiveStyles),
    ...(typeof layoutStyles === "function"
      ? layoutStyles(theme)
      : layoutStyles),
  });

  return combinedStyles;
};

/**
 * Context7: Стили для container'а виджетов с CSS Grid и виртуализацией
 */
export const createWidgetContainerStyles = (
  config: WidgetStyleConfig,
  _theme: Theme
): SxProps<Theme> => {
  const { mode, layout, density } = config;

  const spacing = {
    minimal: WIDGET_DESIGN_TOKENS.spacing.xs,
    compact: WIDGET_DESIGN_TOKENS.spacing.sm,
    detailed: WIDGET_DESIGN_TOKENS.spacing.md,
    fullscreen: WIDGET_DESIGN_TOKENS.spacing.lg,
    overview: WIDGET_DESIGN_TOKENS.spacing.sm,
  };

  const densityMultiplier = {
    dense: 0.75,
    compact: 0.875,
    comfortable: 1,
    spacious: 1.25,
  };

  const finalSpacing = spacing[mode] * densityMultiplier[density];

  return {
    display: "flex",
    flexDirection: layout === "list" ? "column" : "row",
    flexWrap: layout === "masonry" ? "wrap" : "nowrap",
    gap: finalSpacing / 8, // theme spacing units

    // Context7: CSS Grid для masonry layout
    ...(layout === "masonry" && {
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(auto-fit, minmax(300px, 1fr))",
        md: "repeat(auto-fit, minmax(320px, 1fr))",
        lg: "repeat(auto-fit, minmax(340px, 1fr))",
      },
      gridAutoRows: "masonry", // CSS Grid masonry (где поддерживается)
      alignItems: "start",
      columnGap: finalSpacing / 8,
    }),

    // Context7: Performance optimizations
    contain: "layout",
    contentVisibility: "auto",

    // Context7: Responsive optimizations
    "@container (max-width: 960px)": {
      flexDirection: "column",
      gap: (finalSpacing * 0.8) / 8,
    },

    // Context7: Fallback для старых браузеров
    [`@media (max-width: 960px)`]: {
      flexDirection: "column",
      gap: (finalSpacing * 0.8) / 8,
    },
  };
};

/**
 * Context7: Hook для использования стилей виджета с мемоизацией
 */
export const useWidgetStyles = (config: WidgetStyleConfig) => {
  const theme = useTheme();

  return {
    widgetStyles: createWidgetStyles(config, theme),
    containerStyles: createWidgetContainerStyles(config, theme),
    tokens: WIDGET_DESIGN_TOKENS,
  };
};
