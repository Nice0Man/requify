import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useCallback, 
  useMemo,
  useEffect,
  ReactNode,
} from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import type { 
  DashboardMode, 
  DashboardLayoutType, 
  DashboardDensity, 
} from '@/widgets/types';

// Local DashboardWidget interface since it's not available from entities
interface DashboardWidget {
  id: string;
  component: React.ComponentType<any>;
  priority: number;
  size: "small" | "medium" | "large";
  props: Record<string, any>;
  gridSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  visible: {
    [K in DashboardMode]: boolean;
  };
}

/**
 * Состояние дашборда
 */
interface DashboardState {
  // Режим отображения
  mode: DashboardMode;
  layout: DashboardLayoutType; 
  density: DashboardDensity;
  
  // Состояние загрузки и ошибок
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  errorMessage?: string;
  
  // Виджеты
  widgets: DashboardWidget[];
  visibleWidgets: DashboardWidget[];
  
  // UI состояние
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWidescreen: boolean;
  isUltrawide: boolean;
  
  // Настройки
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Персонализация
  userPreferences: {
    favoriteWidgets: string[];
    collapsedWidgets: string[];
    widgetOrder: string[];
  };
}

/**
 * Действия дашборда
 */
type DashboardAction =
  | { type: 'SET_MODE'; payload: DashboardMode }
  | { type: 'SET_LAYOUT'; payload: DashboardLayoutType }
  | { type: 'SET_DENSITY'; payload: DashboardDensity }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { hasError: boolean; message?: string } }
  | { type: 'SET_WIDGETS'; payload: DashboardWidget[] }
  | { type: 'UPDATE_BREAKPOINTS'; payload: Partial<Pick<DashboardState, 'isMobile' | 'isTablet' | 'isDesktop' | 'isWidescreen' | 'isUltrawide'>> }
  | { type: 'TOGGLE_AUTO_REFRESH'; payload?: boolean }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'TOGGLE_WIDGET_FAVORITE'; payload: string }
  | { type: 'TOGGLE_WIDGET_COLLAPSED'; payload: string }
  | { type: 'REORDER_WIDGETS'; payload: string[] }
  | { type: 'RESET_TO_DEFAULTS' };

/**
 * Начальное состояние дашборда
 */
const initialState: DashboardState = {
  mode: 'detailed',
  layout: 'grid',
  density: 'comfortable',
  
  isLoading: false,
  isRefreshing: false,
  hasError: false,
  
  widgets: [],
  visibleWidgets: [],
  
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isWidescreen: false,
  isUltrawide: false,
  
  autoRefresh: false,
  refreshInterval: 30000,
  
  userPreferences: {
    favoriteWidgets: [],
    collapsedWidgets: [],
    widgetOrder: [],
  },
};

/**
 * Reducer для управления состоянием дашборда
 */
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
      
    case 'SET_LAYOUT':
      return { ...state, layout: action.payload };
      
    case 'SET_DENSITY':
      return { ...state, density: action.payload };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
      
    case 'SET_ERROR':
      return { 
        ...state, 
        hasError: action.payload.hasError,
        errorMessage: action.payload.message,
      };
      
    case 'SET_WIDGETS':
      return { 
        ...state, 
        widgets: action.payload,
        visibleWidgets: action.payload.filter(w => w.visible[state.mode]),
      };
      
    case 'UPDATE_BREAKPOINTS':
      return { ...state, ...action.payload };
      
    case 'TOGGLE_AUTO_REFRESH':
      return { 
        ...state, 
        autoRefresh: action.payload !== undefined ? action.payload : !state.autoRefresh,
      };
      
    case 'SET_REFRESH_INTERVAL':
      return { ...state, refreshInterval: action.payload };
      
    case 'TOGGLE_WIDGET_FAVORITE': {
      const favorites = state.userPreferences.favoriteWidgets;
      const widgetId = action.payload;
      const newFavorites = favorites.includes(widgetId)
        ? favorites.filter(id => id !== widgetId)
        : [...favorites, widgetId];
      
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          favoriteWidgets: newFavorites,
        },
      };
    }
    
    case 'TOGGLE_WIDGET_COLLAPSED': {
      const collapsed = state.userPreferences.collapsedWidgets;
      const widgetId = action.payload;
      const newCollapsed = collapsed.includes(widgetId)
        ? collapsed.filter(id => id !== widgetId)
        : [...collapsed, widgetId];
      
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          collapsedWidgets: newCollapsed,
        },
      };
    }
    
    case 'REORDER_WIDGETS':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          widgetOrder: action.payload,
        },
      };
      
    case 'RESET_TO_DEFAULTS':
      return {
        ...initialState,
        // Сохраняем информацию о breakpoint'ах
        isMobile: state.isMobile,
        isTablet: state.isTablet,
        isDesktop: state.isDesktop,
        isWidescreen: state.isWidescreen,
        isUltrawide: state.isUltrawide,
      };
      
    default:
      return state;
  }
}

/**
 * Контекст дашборда
 */
interface DashboardContextValue {
  // Состояние
  state: DashboardState;
  
  // Действия
  setMode: (mode: DashboardMode) => void;
  setLayout: (layout: DashboardLayoutType) => void;
  setDensity: (density: DashboardDensity) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (hasError: boolean, message?: string) => void;
  setWidgets: (widgets: DashboardWidget[]) => void;
  
  // Настройки
  toggleAutoRefresh: (enabled?: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  
  // Персонализация
  toggleWidgetFavorite: (widgetId: string) => void;
  toggleWidgetCollapsed: (widgetId: string) => void;
  reorderWidgets: (widgetIds: string[]) => void;
  resetToDefaults: () => void;
  
  // Computed values
  spacing: {
    container: number;
    grid: number;
  };
  
  // Context7 compatibility
  theme: 'light' | 'dark' | 'auto';
  isAdaptive: boolean;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

/**
 * Провайдер контекста дашборда
 */
interface DashboardProviderProps {
  children: ReactNode;
  initialMode?: DashboardMode;
  initialLayout?: DashboardLayoutType;
  initialDensity?: DashboardDensity;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
  initialMode,
  initialLayout,
  initialDensity,
}) => {
  const theme = useTheme();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isWidescreen = useMediaQuery('(min-width: 1440px)');
  const isUltrawide = useMediaQuery('(min-width: 1920px)');
  
  // Инициализация состояния с учетом пропсов
  const [state, dispatch] = useReducer(dashboardReducer, {
    ...initialState,
    mode: initialMode || (isMobile ? 'compact' : 'detailed'),
    layout: initialLayout || 'grid',
    density: initialDensity || 'comfortable',
    isMobile,
    isTablet,
    isDesktop,
    isWidescreen,
    isUltrawide,
  });
  
  // Обновление breakpoint'ов при изменении размера экрана
  useEffect(() => {
    dispatch({
      type: 'UPDATE_BREAKPOINTS',
      payload: { isMobile, isTablet, isDesktop, isWidescreen, isUltrawide },
    });
  }, [isMobile, isTablet, isDesktop, isWidescreen, isUltrawide]);
  
  // Автоматическая адаптация режима под размер экрана
  useEffect(() => {
    if (isMobile && state.mode !== 'compact') {
      dispatch({ type: 'SET_MODE', payload: 'compact' });
    } else if (isUltrawide && state.mode !== 'fullscreen') {
      dispatch({ type: 'SET_MODE', payload: 'fullscreen' });
    }
  }, [isMobile, isUltrawide, state.mode]);
  
  // Actions
  const setMode = useCallback((mode: DashboardMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);
  
  const setLayout = useCallback((layout: DashboardLayoutType) => {
    dispatch({ type: 'SET_LAYOUT', payload: layout });
  }, []);
  
  const setDensity = useCallback((density: DashboardDensity) => {
    dispatch({ type: 'SET_DENSITY', payload: density });
  }, []);
  
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);
  
  const setRefreshing = useCallback((refreshing: boolean) => {
    dispatch({ type: 'SET_REFRESHING', payload: refreshing });
  }, []);
  
  const setError = useCallback((hasError: boolean, message?: string) => {
    dispatch({ type: 'SET_ERROR', payload: { hasError, message } });
  }, []);
  
  const setWidgets = useCallback((widgets: DashboardWidget[]) => {
    dispatch({ type: 'SET_WIDGETS', payload: widgets });
  }, []);
  
  const toggleAutoRefresh = useCallback((enabled?: boolean) => {
    dispatch({ type: 'TOGGLE_AUTO_REFRESH', payload: enabled });
  }, []);
  
  const setRefreshInterval = useCallback((interval: number) => {
    dispatch({ type: 'SET_REFRESH_INTERVAL', payload: interval });
  }, []);
  
  const toggleWidgetFavorite = useCallback((widgetId: string) => {
    dispatch({ type: 'TOGGLE_WIDGET_FAVORITE', payload: widgetId });
  }, []);
  
  const toggleWidgetCollapsed = useCallback((widgetId: string) => {
    dispatch({ type: 'TOGGLE_WIDGET_COLLAPSED', payload: widgetId });
  }, []);
  
  const reorderWidgets = useCallback((widgetIds: string[]) => {
    dispatch({ type: 'REORDER_WIDGETS', payload: widgetIds });
  }, []);
  
  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  }, []);
  
  // Computed values
  const spacing = useMemo(() => {
    const baseSpacing = {
      minimal: { container: 1, grid: 1 },
      compact: { container: 2, grid: 1.5 },
      detailed: { container: 3, grid: 2 },
      fullscreen: { container: 4, grid: 3 },
      overview: { container: 2.5, grid: 1.75 },
    };
    
    const densityMultiplier = {
      dense: 0.75,
      compact: 0.875,
      comfortable: 1,
      spacious: 1.25,
    };
    
    const base = baseSpacing[state.mode];
    const multiplier = densityMultiplier[state.density];
    
    return {
      container: base.container * multiplier,
      grid: base.grid * multiplier,
    };
  }, [state.mode, state.density]);
  
  // Context value
  const contextValue = useMemo<DashboardContextValue>(() => ({
    state,
    setMode,
    setLayout,
    setDensity,
    setLoading,
    setRefreshing,
    setError,
    setWidgets,
    toggleAutoRefresh,
    setRefreshInterval,
    toggleWidgetFavorite,
    toggleWidgetCollapsed,
    reorderWidgets,
    resetToDefaults,
    spacing,
    
    // Context7 compatibility
    theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    isAdaptive: true,
  }), [
    state,
    setMode,
    setLayout,
    setDensity,
    setLoading,
    setRefreshing,
    setError,
    setWidgets,
    toggleAutoRefresh,
    setRefreshInterval,
    toggleWidgetFavorite,
    toggleWidgetCollapsed,
    reorderWidgets,
    resetToDefaults,
    spacing,
    theme.palette.mode,
  ]);
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

/**
 * Hook для использования контекста дашборда
 */
export const useDashboard = (): DashboardContextValue => {
  const context = useContext(DashboardContext);
  
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  
  return context;
};

/**
 * Hook для работы с виджетами
 */
export const useDashboardWidgets = () => {
  const { state, setWidgets, toggleWidgetFavorite, toggleWidgetCollapsed, reorderWidgets } = useDashboard();
  
  const getVisibleWidgets = useCallback(() => {
    return state.widgets.filter(widget => widget.visible[state.mode]);
  }, [state.widgets, state.mode]);
  
  const getFavoriteWidgets = useCallback(() => {
    return state.widgets.filter(widget => 
      state.userPreferences.favoriteWidgets.includes(widget.id)
    );
  }, [state.widgets, state.userPreferences.favoriteWidgets]);
  
  const isWidgetFavorite = useCallback((widgetId: string) => {
    return state.userPreferences.favoriteWidgets.includes(widgetId);
  }, [state.userPreferences.favoriteWidgets]);
  
  const isWidgetCollapsed = useCallback((widgetId: string) => {
    return state.userPreferences.collapsedWidgets.includes(widgetId);
  }, [state.userPreferences.collapsedWidgets]);
  
  return {
    widgets: state.widgets,
    visibleWidgets: getVisibleWidgets(),
    favoriteWidgets: getFavoriteWidgets(),
    setWidgets,
    toggleWidgetFavorite,
    toggleWidgetCollapsed,
    reorderWidgets,
    isWidgetFavorite,
    isWidgetCollapsed,
  };
};

export default DashboardContext; 