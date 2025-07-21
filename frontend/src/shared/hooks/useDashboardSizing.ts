import { useMemo } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import type {
  DashboardMode,
  DashboardDensity,
  DashboardLayout,
} from "@/shared/types/dashboard";

// Базовые константы размеров
const SIZING_CONSTANTS = {
  // Базовые размеры для разных режимов
  baseSizes: {
    minimal: {
      widgetHeight: 180,
      cardHeight: 120,
      iconSize: 20,
      headerHeight: 60,
      chartHeight: 160,
    },
    compact: {
      widgetHeight: 220,
      cardHeight: 160,
      iconSize: 24,
      headerHeight: 70,
      chartHeight: 200,
    },
    detailed: {
      widgetHeight: 280,
      cardHeight: 200,
      iconSize: 28,
      headerHeight: 80,
      chartHeight: 260,
    },
    fullscreen: {
      widgetHeight: 240,
      cardHeight: 180,
      iconSize: 26,
      headerHeight: 75,
      chartHeight: 220,
    },
  },

  // Мультипликаторы для плотности
  densityMultipliers: {
    dense: 0.85,
    compact: 0.92,
    comfortable: 1.0,
  },

  // Мультипликаторы для разных раскладок
  layoutMultipliers: {
    grid: 1.0,
    list: 0.9,
    masonry: 1.1,
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
    ultrawide: 2560,
  },
} as const;

interface DashboardSizingConfig {
  mode: DashboardMode;
  density: DashboardDensity;
  layout: DashboardLayout;
  masonry?: boolean;
  flexible?: boolean;
  isUltrawide?: boolean;
  isWidescreen?: boolean;
  isMobile?: boolean;
}

interface DashboardSizes {
  // Основные размеры виджетов
  widgetHeight: number;
  cardHeight: number;
  iconSize: number;
  headerHeight: number;
  chartHeight: number;

  // Отступы и расстояния
  padding: {
    xs: number;
    sm: number;
    md: number;
  };
  margins: {
    xs: number;
    sm: number;
    md: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
  };

  // Размеры элементов
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };

  // Grid конфигурация
  gridConfig: {
    minWidth: number;
    maxWidth?: number;
    columns: number;
  };

  // Typography размеры
  typography: {
    title: string;
    subtitle: string;
    body: string;
    caption: string;
  };

  // Box shadow уровни
  elevation: {
    card: string;
    widget: string;
    chart: string;
  };
}

export const useDashboardSizing = (
  config: DashboardSizingConfig
): DashboardSizes => {
  const theme = useTheme();

  // Detect screen sizes
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isWidescreen = useMediaQuery(
    "(min-aspect-ratio: 16/9) and (min-width: 1920px)"
  );
  const isUltrawide = useMediaQuery(
    "(min-aspect-ratio: 21/9) and (min-width: 2560px)"
  );

  const sizes = useMemo(() => {
    const { mode, density, layout, masonry = false, flexible = false } = config;

    // Получаем базовые размеры для режима
    const baseSizeConfig = SIZING_CONSTANTS.baseSizes[mode];

    // Применяем мультипликаторы
    const densityMultiplier = SIZING_CONSTANTS.densityMultipliers[density];
    const layoutMultiplier = SIZING_CONSTANTS.layoutMultipliers[layout];

    // Адаптивный мультипликатор для экрана
    const screenMultiplier = (() => {
      if (isMobile) return 0.85;
      if (isTablet) return 0.92;
      if (isUltrawide) return 1.15;
      if (isWidescreen) return 1.08;
      return 1.0;
    })();

    // Масонский мультипликатор
    const masonryMultiplier = masonry ? 1.1 : 1.0;

    // Общий мультипликатор
    const totalMultiplier =
      densityMultiplier *
      layoutMultiplier *
      screenMultiplier *
      masonryMultiplier;

    // Рассчитываем основные размеры
    const widgetHeight = Math.round(
      baseSizeConfig.widgetHeight * totalMultiplier
    );
    const cardHeight = Math.round(baseSizeConfig.cardHeight * totalMultiplier);
    const iconSize = Math.round(baseSizeConfig.iconSize * densityMultiplier);
    const headerHeight = Math.round(
      baseSizeConfig.headerHeight * densityMultiplier
    );
    const chartHeight = Math.round(
      baseSizeConfig.chartHeight * totalMultiplier
    );

    // Адаптивные отступы
    const getResponsivePadding = () => {
      const base = {
        xs: density === "dense" ? 1.5 : density === "compact" ? 2 : 2.5,
        sm: density === "dense" ? 2 : density === "compact" ? 2.5 : 3,
        md: density === "dense" ? 2.5 : density === "compact" ? 3 : 3.5,
      };

      // Adjust for layout
      if (layout === "masonry") {
        return {
          xs: base.xs * 0.9,
          sm: base.sm * 0.9,
          md: base.md * 0.9,
        };
      }

      if (layout === "list") {
        return {
          xs: base.xs * 0.8,
          sm: base.sm * 0.8,
          md: base.md * 0.8,
        };
      }

      return base;
    };

    const padding = getResponsivePadding();

    // Margins (обычно меньше padding)
    const margins = {
      xs: padding.xs * 0.6,
      sm: padding.sm * 0.6,
      md: padding.md * 0.6,
    };

    // Spacing между элементами - увеличено в 2 раза
    const spacing = {
      xs: padding.xs * 1.6,
      sm: padding.sm * 1.6,
      md: padding.md * 1.6,
    };

    // Border radius на основе режима
    const borderRadius = {
      small: mode === "fullscreen" ? 1.5 : mode === "minimal" ? 2 : 2.5,
      medium: mode === "fullscreen" ? 2 : mode === "minimal" ? 2.5 : 3,
      large: mode === "fullscreen" ? 2.5 : mode === "minimal" ? 3 : 4,
    };

    // Grid конфигурация
    const gridConfig = {
      minWidth: (() => {
        if (layout === "masonry") {
          return mode === "minimal" ? 280 : mode === "compact" ? 320 : 360;
        }
        if (layout === "list") {
          return mode === "minimal" ? 260 : 300;
        }
        return mode === "minimal" ? 300 : mode === "compact" ? 320 : 340;
      })(),
      maxWidth: flexible
        ? undefined
        : (() => {
            if (isMobile) return undefined;
            return mode === "minimal" ? 480 : mode === "compact" ? 520 : 600;
          })(),
      columns: (() => {
        if (isMobile) return 1;
        if (isTablet) return mode === "minimal" ? 1 : 2;
        if (isUltrawide)
          return mode === "minimal" ? 2 : mode === "compact" ? 3 : 3;
        if (isWidescreen)
          return mode === "minimal" ? 2 : mode === "compact" ? 2 : 3;
        return mode === "minimal" ? 1 : mode === "compact" ? 2 : 2;
      })(),
    };

    // Typography размеры
    const typography = {
      title:
        mode === "minimal"
          ? "1.25rem"
          : mode === "compact"
          ? "1.375rem"
          : "1.5rem",
      subtitle:
        mode === "minimal"
          ? "0.875rem"
          : mode === "compact"
          ? "0.9375rem"
          : "1rem",
      body:
        mode === "minimal"
          ? "0.8125rem"
          : mode === "compact"
          ? "0.875rem"
          : "0.9375rem",
      caption:
        mode === "minimal"
          ? "0.75rem"
          : mode === "compact"
          ? "0.8125rem"
          : "0.875rem",
    };

    // Elevation для теней
    const elevation = {
      card:
        mode === "fullscreen"
          ? `0 1px 8px ${theme.palette.action.hover}10`
          : `0 2px 20px ${theme.palette.action.hover}20`,
      widget:
        mode === "fullscreen"
          ? `0 2px 12px ${theme.palette.action.hover}15`
          : `0 4px 32px ${theme.palette.action.hover}25`,
      chart:
        mode === "fullscreen"
          ? `0 1px 6px ${theme.palette.action.hover}08`
          : `0 2px 16px ${theme.palette.action.hover}12`,
    };

    return {
      widgetHeight,
      cardHeight,
      iconSize,
      headerHeight,
      chartHeight,
      padding,
      margins,
      spacing,
      borderRadius,
      gridConfig,
      typography,
      elevation,
    };
  }, [
    config.mode,
    config.density,
    config.layout,
    config.masonry,
    config.flexible,
    isMobile,
    isTablet,
    isDesktop,
    isWidescreen,
    isUltrawide,
    theme,
  ]);

  return sizes;
};

// Convenience hook для получения только размеров контейнера
export const useContainerSizing = (
  mode: DashboardMode,
  density: DashboardDensity,
  layout: DashboardLayout
) => {
  const sizing = useDashboardSizing({ mode, density, layout });

  return {
    minHeight: sizing.widgetHeight,
    padding: sizing.padding,
    borderRadius: sizing.borderRadius.medium,
    elevation: sizing.elevation.widget,
  };
};

// Convenience hook для размеров карточек
export const useCardSizing = (
  mode: DashboardMode,
  density: DashboardDensity,
  masonry = false
) => {
  const sizing = useDashboardSizing({
    mode,
    density,
    layout: masonry ? "masonry" : "grid",
    masonry,
  });

  return {
    minHeight: sizing.cardHeight,
    padding: sizing.padding,
    borderRadius: sizing.borderRadius.small,
    elevation: sizing.elevation.card,
    iconSize: sizing.iconSize,
  };
};

// Convenience hook для размеров графиков
export const useChartSizing = (
  mode: DashboardMode,
  density: DashboardDensity,
  layout: DashboardLayout
) => {
  const sizing = useDashboardSizing({ mode, density, layout });

  return {
    height: sizing.chartHeight,
    padding: sizing.padding,
    borderRadius: sizing.borderRadius.small,
    elevation: sizing.elevation.chart,
  };
};

export type { DashboardSizes, DashboardSizingConfig };
