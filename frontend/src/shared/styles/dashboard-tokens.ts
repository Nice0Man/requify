import type { Theme } from "@mui/material/styles";

// Dashboard Design Tokens - Современная система дизайна
export const DASHBOARD_TOKENS = {
  // Spacing system (8px grid)
  spacing: {
    minimal: {
      xs: 12, // 1.5 * 8
      sm: 16, // 2 * 8
      md: 20, // 2.5 * 8
      lg: 24, // 3 * 8
    },
    compact: {
      xs: 16, // 2 * 8
      sm: 20, // 2.5 * 8
      md: 24, // 3 * 8
      lg: 28, // 3.5 * 8
    },
    comfortable: {
      xs: 20, // 2.5 * 8
      sm: 24, // 3 * 8
      md: 28, // 3.5 * 8
      lg: 32, // 4 * 8
    },
    fullscreen: {
      xs: 8, // 1 * 8
      sm: 12, // 1.5 * 8
      md: 16, // 2 * 8
      lg: 20, // 2.5 * 8
    },
  },

  // Layout dimensions
  layout: {
    sidebar: {
      collapsed: 72,
      expanded: 280,
      mobile: 0, // overlay
    },
    header: {
      height: 64,
      mobile: 56,
    },
    widget: {
      minWidth: 280,
      maxWidth: 800,
      borderRadius: {
        normal: 12,
        fullscreen: 8,
      },
    },
    container: {
      maxWidth: "1600px",
      padding: {
        xs: 16,
        sm: 24,
        md: 32,
      },
    },
  },

  // Color palette extensions
  colors: {
    // Semantic colors for dashboard states
    dashboard: {
      primary: "#2563eb", // Blue-600
      secondary: "#7c3aed", // Violet-600
      success: "#059669", // Emerald-600
      warning: "#d97706", // Amber-600
      error: "#dc2626", // Red-600
      info: "#0891b2", // Cyan-600
    },
    // Surface colors
    surface: {
      elevated: "rgba(255, 255, 255, 0.95)",
      card: "rgba(255, 255, 255, 0.85)",
      overlay: "rgba(255, 255, 255, 0.75)",
      glass: "rgba(255, 255, 255, 0.1)",
    },
    // Text contrast ratios
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.6)",
      disabled: "rgba(0, 0, 0, 0.38)",
      hint: "rgba(0, 0, 0, 0.38)",
    },
  },

  // Shadow system
  shadows: {
    widget: {
      rest: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)",
      hover: "0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
      active: "0 1px 2px rgba(0, 0, 0, 0.1), 0 1px 1px rgba(0, 0, 0, 0.06)",
      focused: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
    container: {
      flat: "none",
      elevated: "0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)",
      floating: "0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08)",
    },
  },

  // Animation & Transitions
  animation: {
    // Стандартные easing curves для лучшего UX
    easing: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      decelerated: "cubic-bezier(0, 0, 0.2, 1)",
      accelerated: "cubic-bezier(0.4, 0, 1, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
    // Длительности для разных типов анимаций
    duration: {
      shortest: 150, // Micro-interactions
      shorter: 200, // Simple transitions
      short: 250, // Standard transitions
      standard: 300, // Complex transitions
      complex: 375, // Enter/exit animations
      enteringScreen: 225,
      leavingScreen: 195,
    },
    // Задержки для staggered animations
    stagger: {
      fast: 50,
      normal: 100,
      slow: 150,
    },
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
    ultrawide: 1920,
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Widget specific tokens
  widget: {
    // Размеры виджетов
    sizes: {
      small: { width: 280, height: 200 },
      medium: { width: 400, height: 280 },
      large: { width: 580, height: 360 },
      xlarge: { width: 800, height: 480 },
    },
    // Отступы внутри виджетов
    padding: {
      minimal: { xs: 12, sm: 16, md: 20 },
      compact: { xs: 16, sm: 20, md: 24 },
      comfortable: { xs: 20, sm: 24, md: 28 },
    },
    // Типографика для виджетов
    typography: {
      title: {
        fontSize: "1.125rem", // 18px
        fontWeight: 600,
        lineHeight: 1.4,
      },
      subtitle: {
        fontSize: "0.875rem", // 14px
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body: {
        fontSize: "0.875rem", // 14px
        fontWeight: 400,
        lineHeight: 1.6,
      },
      caption: {
        fontSize: "0.75rem", // 12px
        fontWeight: 400,
        lineHeight: 1.5,
      },
    },
  },
} as const;

// Utility types for type safety
export type DashboardMode = "minimal" | "compact" | "detailed" | "fullscreen";
export type DashboardLayout = "grid" | "list" | "masonry";
export type DashboardDensity = "dense" | "compact" | "comfortable";
export type WidgetSize = "small" | "medium" | "large" | "xlarge" | "auto";

// Helper functions for theme integration
export const getDashboardToken = (path: string): any => {
  const tokens = path
    .split(".")
    .reduce((obj, key) => obj?.[key], DASHBOARD_TOKENS as any);
  return tokens;
};

export const getSpacingForMode = (
  mode: DashboardMode,
  density: DashboardDensity,
  size: "xs" | "sm" | "md" | "lg" = "md"
): number => {
  const modeSpacing =
    mode === "fullscreen"
      ? DASHBOARD_TOKENS.spacing.fullscreen
      : DASHBOARD_TOKENS.spacing[density === "dense" ? "compact" : density];
  return modeSpacing[size];
};

export const getWidgetPadding = (
  density: DashboardDensity,
  size: "xs" | "sm" | "md" = "md"
): number => {
  return DASHBOARD_TOKENS.widget.padding[
    density === "dense" ? "compact" : density
  ][size];
};

export const getShadowForState = (
  state: "rest" | "hover" | "active" | "focused" = "rest"
): string => {
  return DASHBOARD_TOKENS.shadows.widget[state];
};

export const getAnimationDuration = (
  type: "shortest" | "shorter" | "short" | "standard" | "complex" = "standard"
): number => {
  return DASHBOARD_TOKENS.animation.duration[type];
};

export const getStaggerDelay = (
  index: number,
  speed: "fast" | "normal" | "slow" = "normal"
): number => {
  return index * DASHBOARD_TOKENS.animation.stagger[speed];
};
