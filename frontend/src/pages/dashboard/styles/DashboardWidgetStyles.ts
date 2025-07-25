import { alpha, Theme, useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material';
import type { DashboardMode, DashboardLayoutType, DashboardDensity } from '@/shared/types/dashboard';

/**
 * Размеры виджетов
 */
export type WidgetSize = 'small' | 'medium' | 'large' | 'xl';

/**
 * Варианты виджетов
 */
export type WidgetVariant = 'default' | 'elevated' | 'outlined' | 'filled';

/**
 * Состояния виджетов
 */
export type WidgetState = 'default' | 'loading' | 'error' | 'empty' | 'disabled';

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
 * Context7-совместимые токены дизайна
 */
export const WIDGET_DESIGN_TOKENS = {
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  
  // Border radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: '50%',
  },
  
  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Z-index
  zIndex: {
    widget: 1,
    widgetHeader: 10,
    widgetOverlay: 20,
    widgetModal: 30,
    widgetTooltip: 40,
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  
  // Typography
  typography: {
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
} as const;

/**
 * Получить размеры виджета в зависимости от режима и плотности
 */
export const getWidgetSizing = (config: WidgetStyleConfig) => {
  const { mode, density, size = 'medium' } = config;
  
  const baseSizes = {
    small: { minHeight: 120, padding: WIDGET_DESIGN_TOKENS.spacing.sm },
    medium: { minHeight: 200, padding: WIDGET_DESIGN_TOKENS.spacing.md },
    large: { minHeight: 300, padding: WIDGET_DESIGN_TOKENS.spacing.lg },
    xl: { minHeight: 400, padding: WIDGET_DESIGN_TOKENS.spacing.xl },
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
    minHeight: Math.round(baseSize.minHeight * modeMultiplier * densityMultiplier),
    padding: Math.round(baseSize.padding * densityMultiplier),
  };
};

/**
 * Получить стили для варианта виджета
 */
export const getWidgetVariantStyles = (
  variant: WidgetVariant,
  theme: Theme
): SxProps<Theme> => {
  const baseStyles: SxProps<Theme> = {
    borderRadius: WIDGET_DESIGN_TOKENS.borderRadius.lg,
    transition: WIDGET_DESIGN_TOKENS.transitions.normal,
    overflow: 'hidden',
  };
  
  switch (variant) {
    case 'elevated':
      return {
        ...baseStyles,
        bgcolor: 'background.paper',
        boxShadow: WIDGET_DESIGN_TOKENS.shadows.lg,
        border: 'none',
        '&:hover': {
          boxShadow: WIDGET_DESIGN_TOKENS.shadows.xl,
          transform: 'translateY(-2px)',
        },
      };
      
    case 'outlined':
      return {
        ...baseStyles,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: WIDGET_DESIGN_TOKENS.shadows.md,
        },
      };
      
    case 'filled':
      return {
        ...baseStyles,
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        boxShadow: 'none',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          borderColor: alpha(theme.palette.primary.main, 0.2),
        },
      };
      
    default: // 'default'
      return {
        ...baseStyles,
        bgcolor: 'background.paper',
        boxShadow: WIDGET_DESIGN_TOKENS.shadows.md,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        '&:hover': {
          boxShadow: WIDGET_DESIGN_TOKENS.shadows.lg,
        },
      };
  }
};

/**
 * Получить стили для состояния виджета
 */
export const getWidgetStateStyles = (
  state: WidgetState,
  theme: Theme
): SxProps<Theme> => {
  switch (state) {
    case 'loading':
      return {
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          zIndex: WIDGET_DESIGN_TOKENS.zIndex.widgetOverlay,
        },
      };
      
    case 'error':
      return {
        borderColor: theme.palette.error.main,
        bgcolor: alpha(theme.palette.error.main, 0.05),
        '& .widget-header': {
          color: theme.palette.error.main,
        },
      };
      
    case 'empty':
      return {
        opacity: 0.6,
        '& .widget-content': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120,
        },
      };
      
    case 'disabled':
      return {
        opacity: 0.5,
        pointerEvents: 'none',
        filter: 'grayscale(50%)',
      };
      
    default:
      return {};
  }
};

/**
 * Получить стили для интерактивного виджета
 */
export const getInteractiveWidgetStyles = (
  interactive: boolean,
  theme: Theme
): SxProps<Theme> => {
  if (!interactive) return {};
  
  return {
    cursor: 'pointer',
    transition: `all ${WIDGET_DESIGN_TOKENS.transitions.normal}`,
    
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: WIDGET_DESIGN_TOKENS.shadows.xl,
    },
    
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: WIDGET_DESIGN_TOKENS.shadows.md,
    },
    
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  };
};

/**
 * Получить стили для layout'а виджета
 */
export const getWidgetLayoutStyles = (
  layout: DashboardLayoutType,
  theme: Theme
): SxProps<Theme> => {
  switch (layout) {
    case 'list':
      return {
        width: '100%',
        '& .widget-content': {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: WIDGET_DESIGN_TOKENS.spacing.md,
        },
      };
      
    case 'masonry':
      return {
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
        '& .widget-content': {
          display: 'flex',
          flexDirection: 'column',
        },
      };
      
    default: // 'grid'
      return {
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
      };
  }
};

/**
 * Главная функция для получения стилей виджета
 */
export const createWidgetStyles = (
  config: WidgetStyleConfig,
  theme: Theme
): SxProps<Theme> => {
  const {
    variant = 'default',
    state = 'default',
    interactive = false,
    layout,
  } = config;
  
  const sizing = getWidgetSizing(config);
  const variantStyles = getWidgetVariantStyles(variant, theme);
  const stateStyles = getWidgetStateStyles(state, theme);
  const interactiveStyles = getInteractiveWidgetStyles(interactive, theme);
  const layoutStyles = getWidgetLayoutStyles(layout, theme);
  
  return {
    // Базовые размеры
    minHeight: sizing.minHeight,
    
    // Объединяем все стили
    ...variantStyles,
    ...stateStyles,
    ...interactiveStyles,
    ...layoutStyles,
    
    // Внутренний padding
    '& .widget-content': {
      p: sizing.padding / 8, // конвертируем в theme spacing units
    },
    
    // Заголовок виджета
    '& .widget-header': {
      pb: sizing.padding / 16,
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      mb: sizing.padding / 16,
    },
    
    // Анимации
    '& .widget-enter': {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    
    '& .widget-enter-active': {
      opacity: 1,
      transform: 'translateY(0)',
      transition: `all ${WIDGET_DESIGN_TOKENS.transitions.normal}`,
    },
    
    // Адаптивность
    [theme.breakpoints.down('md')]: {
      minHeight: sizing.minHeight * 0.8,
      '& .widget-content': {
        p: (sizing.padding * 0.8) / 8,
      },
    },
  };
};

/**
 * Стили для container'а виджетов
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
    display: 'flex',
    flexDirection: layout === 'list' ? 'column' : 'row',
    flexWrap: layout === 'masonry' ? 'wrap' : 'nowrap',
    gap: finalSpacing / 8, // theme spacing units
    
    ...(layout === 'masonry' && {
      columns: {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
      },
      columnGap: finalSpacing / 8,
    }),
    
    // Адаптивность
    [`@media (max-width: 960px)`]: {
      flexDirection: 'column',
      gap: (finalSpacing * 0.8) / 8,
    },
  };
};

/**
 * Hook для использования стилей виджета
 */
export const useWidgetStyles = (config: WidgetStyleConfig) => {
  const theme = useTheme();
  
  return {
    widgetStyles: createWidgetStyles(config, theme),
    containerStyles: createWidgetContainerStyles(config, theme),
    tokens: WIDGET_DESIGN_TOKENS,
  };
}; 