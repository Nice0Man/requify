import React, { createContext, useContext, useMemo, useCallback } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { Theme, Components } from "@mui/material/styles";
import {
  DASHBOARD_TOKENS,
  type DashboardMode,
  type DashboardLayout,
  type DashboardDensity,
} from "../styles/dashboard-tokens";
import { useDashboardStyleSystem } from "../styles/dashboard-hooks";

// Dashboard Theme Context
interface DashboardThemeContextValue {
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  theme: Theme;
  setMode: (mode: DashboardMode) => void;
  setLayout: (layout: DashboardLayout) => void;
  setDensity: (density: DashboardDensity) => void;
  styleSystem: ReturnType<typeof useDashboardStyleSystem>;
}

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(
  null
);

// Custom Material-UI компоненты для Dashboard
const createDashboardComponents = (
  mode: DashboardMode,
  density: DashboardDensity
): Components<Omit<Theme, "components">> => ({
  // Card компонент для виджетов
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius:
          mode === "fullscreen"
            ? DASHBOARD_TOKENS.layout.widget.borderRadius.fullscreen
            : DASHBOARD_TOKENS.layout.widget.borderRadius.normal,
        boxShadow: DASHBOARD_TOKENS.shadows.widget.rest,
        backgroundColor: DASHBOARD_TOKENS.colors.surface.card,
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        transition: `all ${DASHBOARD_TOKENS.animation.duration.standard}ms ${DASHBOARD_TOKENS.animation.easing.standard}`,

        "&:hover": {
          boxShadow: DASHBOARD_TOKENS.shadows.widget.hover,
          transform: mode === "fullscreen" ? "none" : "translateY(-2px)",
        },

        "&:focus-within": {
          boxShadow: DASHBOARD_TOKENS.shadows.widget.focused,
          outline: "none",
        },
      },
    },
  },

  // Container для dashboard layout
  MuiContainer: {
    styleOverrides: {
      root: {
        maxWidth: DASHBOARD_TOKENS.layout.container.maxWidth,
        padding:
          density === "dense"
            ? `${DASHBOARD_TOKENS.layout.container.padding.xs}px`
            : `${DASHBOARD_TOKENS.layout.container.padding.md}px`,

        // Responsive padding
        "@media (max-width: 768px)": {
          padding: `${DASHBOARD_TOKENS.layout.container.padding.xs}px`,
        },
      },
    },
  },

  // Paper компонент
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none", // Убираем стандартный gradient
        backgroundColor: DASHBOARD_TOKENS.colors.surface.elevated,
      },
      elevation1: {
        boxShadow: DASHBOARD_TOKENS.shadows.container.elevated,
      },
      elevation2: {
        boxShadow: DASHBOARD_TOKENS.shadows.container.floating,
      },
    },
  },

  // Button оптимизации
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: "none",
        fontWeight: 500,
        transition: `all ${DASHBOARD_TOKENS.animation.duration.shorter}ms ${DASHBOARD_TOKENS.animation.easing.standard}`,
      },
    },
  },

  // IconButton для dashboard
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        transition: `all ${DASHBOARD_TOKENS.animation.duration.shorter}ms ${DASHBOARD_TOKENS.animation.easing.standard}`,

        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
          transform: "scale(1.05)",
        },
      },
    },
  },

  // Typography оптимизации
  MuiTypography: {
    styleOverrides: {
      h4: DASHBOARD_TOKENS.widget.typography.title,
      h5: DASHBOARD_TOKENS.widget.typography.title,
      h6: DASHBOARD_TOKENS.widget.typography.subtitle,
      body1: DASHBOARD_TOKENS.widget.typography.body,
      body2: DASHBOARD_TOKENS.widget.typography.body,
      caption: DASHBOARD_TOKENS.widget.typography.caption,
    },
  },

  // Skeleton для loading states
  MuiSkeleton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: "rgba(0, 0, 0, 0.06)",
      },
    },
  },

  // Grid оптимизации
  MuiGrid: {
    styleOverrides: {
      item: {
        // Оптимизация для grid layout
        "& .dashboard-widget": {
          height: "100%",
          display: "flex",
          flexDirection: "column",
        },
      },
    },
  },
});

// Theme factory with performance optimizations
const createDashboardTheme = (
  baseTheme: Theme,
  mode: DashboardMode,
  density: DashboardDensity
): Theme => {
  return createTheme({
    ...baseTheme,
    components: {
      ...baseTheme.components,
      ...createDashboardComponents(mode, density),
    },
    spacing: (factor: number) => `${factor * 8}px`, // 8px grid system
    shape: {
      borderRadius:
        mode === "fullscreen"
          ? DASHBOARD_TOKENS.layout.widget.borderRadius.fullscreen
          : DASHBOARD_TOKENS.layout.widget.borderRadius.normal,
    },
    zIndex: {
      ...baseTheme.zIndex,
      modal: DASHBOARD_TOKENS.zIndex.modal,
      tooltip: DASHBOARD_TOKENS.zIndex.tooltip,
      drawer: DASHBOARD_TOKENS.zIndex.dropdown,
    },
    transitions: {
      ...baseTheme.transitions,
      easing: {
        ...baseTheme.transitions.easing,
        easeInOut: DASHBOARD_TOKENS.animation.easing.standard,
        easeOut: DASHBOARD_TOKENS.animation.easing.decelerated,
        easeIn: DASHBOARD_TOKENS.animation.easing.accelerated,
      },
      duration: {
        ...baseTheme.transitions.duration,
        shortest: DASHBOARD_TOKENS.animation.duration.shortest,
        shorter: DASHBOARD_TOKENS.animation.duration.shorter,
        short: DASHBOARD_TOKENS.animation.duration.short,
        standard: DASHBOARD_TOKENS.animation.duration.standard,
        complex: DASHBOARD_TOKENS.animation.duration.complex,
      },
    },
  });
};

// Dashboard Theme Provider Props
interface DashboardThemeProviderProps {
  children: React.ReactNode;
  initialMode?: DashboardMode;
  initialLayout?: DashboardLayout;
  initialDensity?: DashboardDensity;
  baseTheme?: Theme;
  enableAnimations?: boolean;
  reducedMotion?: boolean;
}

// Dashboard Theme Provider Component
export const DashboardThemeProvider: React.FC<DashboardThemeProviderProps> = ({
  children,
  initialMode = "detailed",
  initialLayout = "grid",
  initialDensity = "comfortable",
  baseTheme,
  enableAnimations = true,
  reducedMotion = false,
}) => {
  const [mode, setModeState] = React.useState<DashboardMode>(initialMode);
  const [layout, setLayoutState] =
    React.useState<DashboardLayout>(initialLayout);
  const [density, setDensityState] =
    React.useState<DashboardDensity>(initialDensity);

  // Memoized callbacks для предотвращения ререндеров
  const setMode = useCallback((newMode: DashboardMode) => {
    setModeState(newMode);
  }, []);

  const setLayout = useCallback((newLayout: DashboardLayout) => {
    setLayoutState(newLayout);
  }, []);

  const setDensity = useCallback((newDensity: DashboardDensity) => {
    setDensityState(newDensity);
  }, []);

  // Style system hook
  const styleSystem = useDashboardStyleSystem(mode, layout, density, {
    enableAnimations,
    reducedMotion,
  });

  // Создаем theme с мемоизацией
  const dashboardTheme = useMemo(() => {
    return createDashboardTheme(baseTheme || createTheme(), mode, density);
  }, [baseTheme, mode, density]);

  // Context value с мемоизацией
  const contextValue = useMemo<DashboardThemeContextValue>(
    () => ({
      mode,
      layout,
      density,
      theme: dashboardTheme,
      setMode,
      setLayout,
      setDensity,
      styleSystem,
    }),
    [
      mode,
      layout,
      density,
      dashboardTheme,
      setMode,
      setLayout,
      setDensity,
      styleSystem,
    ]
  );

  return (
    <DashboardThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={dashboardTheme}>{children}</ThemeProvider>
    </DashboardThemeContext.Provider>
  );
};

// Hook для использования Dashboard Theme
export const useDashboardTheme = (): DashboardThemeContextValue => {
  const context = useContext(DashboardThemeContext);

  if (!context) {
    throw new Error(
      "useDashboardTheme должен использоваться внутри DashboardThemeProvider"
    );
  }

  return context;
};

// Utility hooks для удобства
export const useDashboardMode = () => {
  const { mode, setMode } = useDashboardTheme();
  return [mode, setMode] as const;
};

export const useDashboardLayout = () => {
  const { layout, setLayout } = useDashboardTheme();
  return [layout, setLayout] as const;
};

export const useDashboardDensity = () => {
  const { density, setDensity } = useDashboardTheme();
  return [density, setDensity] as const;
};

export const useDashboardStyles = () => {
  const { styleSystem } = useDashboardTheme();
  return styleSystem;
};

// Prebuilt style hooks для распространенных паттернов
export const useWidgetContainerStyles = () => {
  const { styleSystem } = useDashboardTheme();
  return useCallback(
    (overrides?: any) => styleSystem.getWidgetStyles(overrides),
    [styleSystem]
  );
};

export const useAnimatedContainerStyles = () => {
  const { styleSystem } = useDashboardTheme();
  return useCallback(
    (animationType: "fadeIn" | "slideUp" | "staggerContainer" = "fadeIn") =>
      styleSystem.getAnimatedStyles(animationType),
    [styleSystem]
  );
};

// Performance monitoring hook
export const useDashboardPerformance = () => {
  const { mode, layout, density } = useDashboardTheme();

  return useMemo(
    () => ({
      isHighPerformanceMode: mode === "minimal" || density === "dense",
      shouldReduceAnimations: mode === "minimal",
      shouldLimitWidgets: mode === "minimal" || density === "dense",
      optimalWidgetCount: mode === "minimal" ? 6 : mode === "compact" ? 12 : 24,
    }),
    [mode, layout, density]
  );
};
