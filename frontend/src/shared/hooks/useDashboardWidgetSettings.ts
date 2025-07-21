import { useMemo } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
  WidgetConfig,
  ModeSettings,
  WidgetDimensions,
  WidgetSize,
  WidgetPriority,
  SpacingConfig,
} from '@/shared/types/dashboard';

export interface ComputedWidgetSettings extends ModeSettings {
  dimensions: WidgetDimensions;
  spacing: SpacingConfig;
  zIndex: number;
  opacity: number;
  transform?: string;
  transition?: string;
}

export const useDashboardWidgetSettings = (
  config: WidgetConfig,
  mode: DashboardMode,
  layout: DashboardLayout,
  density: DashboardDensity,
  overrides?: Partial<ModeSettings>
): ComputedWidgetSettings => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return useMemo(() => {
    // Получаем базовые настройки для текущего режима
    const modeSettings = config.modes?.[mode] || {};
    const layoutSettings = config.layouts?.[layout] || {};
    
    // Объединяем настройки с приоритетом: overrides > layoutSettings > modeSettings > defaults
    const mergedSettings: ModeSettings = {
      size: overrides?.size || layoutSettings.size || modeSettings.size || config.defaultSize || 'medium',
      visible: overrides?.visible ?? layoutSettings.visible ?? modeSettings.visible ?? true,
      priority: overrides?.priority || layoutSettings.priority || modeSettings.priority || config.defaultPriority || 'normal',
      aspectRatio: overrides?.aspectRatio || layoutSettings.aspectRatio || modeSettings.aspectRatio || config.defaultAspectRatio || 'auto',
      minHeight: overrides?.minHeight || layoutSettings.minHeight || modeSettings.minHeight,
      maxHeight: overrides?.maxHeight || layoutSettings.maxHeight || modeSettings.maxHeight,
      spacing: {
        ...modeSettings.spacing,
        ...layoutSettings.spacing,
        ...overrides?.spacing,
      },
    };

    // Вычисляем размеры на основе размера виджета
    const dimensions = calculateDimensions(
      mergedSettings.size!,
      mode,
      layout,
      density,
      isMobile,
      isTablet,
      config.responsive
    );

    // Добавляем минимальные и максимальные размеры
    if (mergedSettings.minHeight) {
      dimensions.minHeight = mergedSettings.minHeight;
    }
    if (mergedSettings.maxHeight) {
      dimensions.maxHeight = mergedSettings.maxHeight;
    }

    // Вычисляем отступы на основе плотности
    const spacing = calculateSpacing(density, mergedSettings.spacing || {});

    // Вычисляем z-index на основе приоритета
    const zIndex = calculateZIndex(mergedSettings.priority!);

    // Вычисляем opacity для разных режимов
    const opacity = mode === 'minimal' ? 0.9 : 1;

    return {
      ...mergedSettings,
      dimensions,
      spacing,
      zIndex,
      opacity,
      transition: theme.transitions.create(['all'], {
        duration: theme.transitions.duration.standard,
        easing: theme.transitions.easing.easeInOut,
      }),
    };
  }, [config, mode, layout, density, overrides, theme, isMobile, isTablet]);
};

// Вычисляет размеры виджета
function calculateDimensions(
  size: WidgetSize,
  mode: DashboardMode,
  layout: DashboardLayout,
  density: DashboardDensity,
  isMobile: boolean,
  isTablet: boolean
): WidgetDimensions {
  const baseMultiplier = getBaseMultiplier(density);
  
  // Базовые размеры для разных размеров виджетов
  const sizeMap: Record<WidgetSize, { width: number | string; height: number | string }> = {
    small: { width: 280 * baseMultiplier, height: 200 * baseMultiplier },
    medium: { width: 400 * baseMultiplier, height: 280 * baseMultiplier },
    large: { width: 580 * baseMultiplier, height: 360 * baseMultiplier },
    xlarge: { width: 800 * baseMultiplier, height: 480 * baseMultiplier },
    auto: { width: 'auto', height: 'auto' },
  };

  let baseDimensions = sizeMap[size];

  // Адаптация под режим дашборда
  if (mode === 'minimal') {
    baseDimensions = {
      width: typeof baseDimensions.width === 'number' ? baseDimensions.width * 0.8 : baseDimensions.width,
      height: typeof baseDimensions.height === 'number' ? baseDimensions.height * 0.7 : baseDimensions.height,
    };
  } else if (mode === 'fullscreen') {
    baseDimensions = {
      width: typeof baseDimensions.width === 'number' ? baseDimensions.width * 1.2 : baseDimensions.width,
      height: typeof baseDimensions.height === 'number' ? baseDimensions.height * 1.1 : baseDimensions.height,
    };
  }

  // Адаптация под layout
  if (layout === 'list') {
    return {
      width: '100%',
      height: typeof baseDimensions.height === 'number' ? Math.min(baseDimensions.height, 200 * baseMultiplier) : baseDimensions.height,
      minHeight: 120 * baseMultiplier,
      maxHeight: 300 * baseMultiplier,
    };
  }

  // Адаптация под мобильные устройства
  if (isMobile) {
    return {
      width: '100%',
      height: typeof baseDimensions.height === 'number' ? baseDimensions.height * 0.8 : baseDimensions.height,
      minHeight: 150,
      maxHeight: 400,
    };
  }

  if (isTablet) {
    return {
      width: typeof baseDimensions.width === 'number' ? Math.min(baseDimensions.width, 480) : baseDimensions.width,
      height: baseDimensions.height,
      minHeight: 180,
    };
  }

  return {
    width: baseDimensions.width,
    height: baseDimensions.height,
    minHeight: 150,
  };
}

// Вычисляет отступы на основе плотности
function calculateSpacing(density: DashboardDensity, customSpacing: SpacingConfig): SpacingConfig {
  const baseSpacing = {
    comfortable: { padding: '24px', margin: '16px', gap: '16px' },
    compact: { padding: '16px', margin: '12px', gap: '12px' },
    dense: { padding: '12px', margin: '8px', gap: '8px' },
  };

  const defaultSpacing = baseSpacing[density];

  return {
    padding: customSpacing.padding || defaultSpacing.padding,
    margin: customSpacing.margin || defaultSpacing.margin,
    gap: customSpacing.gap || defaultSpacing.gap,
  };
}

// Вычисляет z-index на основе приоритета
function calculateZIndex(priority: WidgetPriority): number {
  const priorityMap: Record<WidgetPriority, number> = {
    low: 1,
    normal: 10,
    high: 20,
    critical: 30,
  };

  return priorityMap[priority];
}

// Получает базовый множитель для плотности
function getBaseMultiplier(density: DashboardDensity): number {
  switch (density) {
    case 'comfortable': return 1.1;
    case 'compact': return 1.0;
    case 'dense': return 0.9;
    default: return 1.0;
  }
} 