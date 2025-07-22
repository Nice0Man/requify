import type { Theme } from "@mui/material/styles";
import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
  WidgetSize,
} from "../types/dashboard";

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

  // Shadow system - Context7 centralized approach
  shadows: {
    // Base elevation system (Material Design + Context7)
    elevation: {
      none: "none",
      xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
      sm: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)",
      md: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.08)",
      xl: "0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.08)",
      "2xl": "0 25px 50px rgba(0, 0, 0, 0.12), 0 12px 20px rgba(0, 0, 0, 0.08)",
    },
    // Component-specific shadows (no duplication)
    component: {
      // Widget shadows (only for widgets, nowhere else)
      widget: {
        rest: "0 1px 3px rgba(0, 0, 0, 0.08)",
        hover: "0 4px 12px rgba(0, 0, 0, 0.1)",
        active: "0 1px 2px rgba(0, 0, 0, 0.1)",
        focus: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
      // Container shadows (for layout containers only)
      container: {
        flat: "none",
        subtle: "0 1px 3px rgba(0, 0, 0, 0.05)",
        elevated: "0 4px 8px rgba(0, 0, 0, 0.06)",
        floating: "0 8px 16px rgba(0, 0, 0, 0.08)",
      },
      // Navigation shadows
      navigation: {
        sidebar: "2px 0 8px rgba(0, 0, 0, 0.02)",
        header: "0 1px 3px rgba(0, 0, 0, 0.05)",
      },
    },
    // Dark mode variants
    dark: {
      widget: {
        rest: "0 1px 3px rgba(0, 0, 0, 0.2)",
        hover: "0 4px 12px rgba(0, 0, 0, 0.25)",
        active: "0 1px 2px rgba(0, 0, 0, 0.2)",
        focus: "0 0 0 3px rgba(59, 130, 246, 0.2)",
      },
      container: {
        flat: "none",
        subtle: "0 1px 3px rgba(0, 0, 0, 0.15)",
        elevated: "0 4px 8px rgba(0, 0, 0, 0.18)",
        floating: "0 8px 16px rgba(0, 0, 0, 0.22)",
      },
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

  // Z-index scale - Context7 centralized system
  zIndex: {
    // Base levels
    hide: -1,
    auto: "auto",
    base: 0,

    // Dashboard-specific z-index hierarchy
    dashboard: {
      background: 0,
      container: 1,
      widget: {
        rest: 2,
        hover: 3,
        active: 4,
        focus: 5,
      },
      navigation: {
        sidebar: 10,
        header: 11,
        mobile_overlay: 12,
      },
      controls: {
        sidebar: 15,
        floating_actions: 16,
      },
      interactions: {
        tooltip: 20,
        dropdown: 25,
        modal_backdrop: 30,
        modal: 31,
      },
      system: {
        loading: 50,
        error: 51,
        debug: 100,
      },
    },

    // Legacy MUI levels (for compatibility)
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

// Utility types imported from shared/types/dashboard

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
  state: "rest" | "hover" | "active" | "focus" = "rest"
): string => {
  return DASHBOARD_TOKENS.shadows.component.widget[state];
};

// Helper function to get z-index for dashboard components
export const getDashboardZIndex = (
  component:
    | "container"
    | "widget"
    | "navigation"
    | "controls"
    | "interactions"
    | "system",
  state?: string
): number => {
  const dashboardZ = DASHBOARD_TOKENS.zIndex.dashboard;

  if (component === "widget" && state) {
    return (
      dashboardZ.widget[state as keyof typeof dashboardZ.widget] ||
      dashboardZ.widget.rest
    );
  }

  if (component === "navigation" && state) {
    return (
      dashboardZ.navigation[state as keyof typeof dashboardZ.navigation] ||
      dashboardZ.navigation.sidebar
    );
  }

  if (component === "controls" && state) {
    return (
      dashboardZ.controls[state as keyof typeof dashboardZ.controls] ||
      dashboardZ.controls.sidebar
    );
  }

  if (component === "interactions" && state) {
    return (
      dashboardZ.interactions[state as keyof typeof dashboardZ.interactions] ||
      dashboardZ.interactions.tooltip
    );
  }

  if (component === "system" && state) {
    return (
      dashboardZ.system[state as keyof typeof dashboardZ.system] ||
      dashboardZ.system.loading
    );
  }

  // Для компонентов без состояния возвращаем базовое значение
  switch (component) {
    case "container":
      return dashboardZ.container;
    case "widget":
      return dashboardZ.widget.rest;
    case "navigation":
      return dashboardZ.navigation.sidebar;
    case "controls":
      return dashboardZ.controls.sidebar;
    case "interactions":
      return dashboardZ.interactions.tooltip;
    case "system":
      return dashboardZ.system.loading;
    default:
      return dashboardZ.container;
  }
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
