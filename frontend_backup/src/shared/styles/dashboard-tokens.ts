/**
 * Dashboard Design Tokens
 * Дизайн-токены для дашборда
 */

export const DASHBOARD_TOKENS = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  grid: {
    columns: 12,
    gutters: {
      xs: 8,
      sm: 16,
      md: 24,
    },
  },
  typography: {
    widget: {
      title: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.5,
      },
      subtitle: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.4,
      },
    },
  },
  colors: {
    dashboard: {
      primary: "#1976d2",
      secondary: "#dc004e",
      success: "#2e7d32",
      warning: "#ed6c02",
      error: "#d32f2f",
      info: "#0288d1",
    },
    surface: {
      card: "#ffffff",
      background: "#f5f5f5",
    },
  },
  animation: {
    duration: {
      shorter: 200,
      shortest: 150,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      decelerated: "cubic-bezier(0.0, 0, 0.2, 1)",
      accelerated: "cubic-bezier(0.4, 0, 1, 1)",
    },
    stagger: {
      fast: 50,
      medium: 100,
      slow: 150,
    },
  },
  shadows: {
    component: {
      widget: {
        hover: "0 4px 8px rgba(0,0,0,0.15)",
        active: "0 2px 4px rgba(0,0,0,0.1)",
      },
    },
  },
};
