import type { AdaptiveWidgetProps } from "@/widgets/types";
import type { SxProps, Theme } from "@mui/material/styles";
import type {
  QuickAction,
  ActionGroup,
  ActionsFilters,
  ActionUsageStats,
  UserActionsConfig,
} from "@/features/actions";

/**
 * Конфигурация отображения виджета быстрых действий
 */
export interface QuickActionsDisplayConfig {
  /** Вариант отображения */
  variant: "cards" | "list" | "grid" | "compact";
  
  /** Показывать описания */
  showDescriptions: boolean;
  
  /** Показывать иконки */
  showIcons: boolean;
  
  /** Показывать горячие клавиши */
  showShortcuts: boolean;
  
  /** Группировать по категориям */
  groupByCategory: boolean;
  
  /** Максимальное количество действий */
  maxActions: number;
  
  /** Количество колонок в сетке */
  columns: number;
  
  /** Компактный режим */
  compact: boolean;
  
  /** Показывать только избранные */
  showFavoritesOnly: boolean;
  
  /** Анимации */
  animations: boolean;
  
  /** Показывать статистику использования */
  showUsageStats: boolean;
}

/**
 * Пропы для QuickActionsWidget
 * Теперь использует типы из actions entity
 */
export interface QuickActionsWidgetProps extends AdaptiveWidgetProps {
  /** CSS классы */
  className?: string;
  /** Стили MUI */
  sx?: SxProps<Theme>;
  /** Быстрые действия */
  actions?: QuickAction[];
  
  /** Группы действий */
  groups?: ActionGroup[];
  
  /** Конфигурация отображения */
  displayConfig?: Partial<QuickActionsDisplayConfig>;
  
  /** Фильтры */
  filters?: ActionsFilters;
  
  /** Статистика использования */
  usageStats?: ActionUsageStats[];
  
  /** Конфигурация пользователя */
  userConfig?: UserActionsConfig;
  
  /** Избранные действия */
  favoriteActions?: string[];
  
  /** Загрузка данных */
  isDataLoading?: boolean;
  
  /** Ошибка загрузки */
  dataError?: Error | null;
  
  /** Обработчик выполнения действия */
  onActionExecute?: (action: QuickAction) => void;
  
  /** Обработчик клика по действию */
  onActionClick?: (action: QuickAction) => void;
  
  /** Обработчик добавления в избранное */
  onToggleFavorite?: (actionId: string, isFavorite: boolean) => void;
  
  /** Обработчик изменения фильтров */
  onFiltersChange?: (filters: ActionsFilters) => void;
  
  /** Обработчик настроек */
  onSettings?: () => void;
  
  /** Обработчик обновления */
  onRefresh?: () => void;
  
  /** Показывать настройки */
  showSettings?: boolean;
  
  /** Показывать обновление */
  showRefresh?: boolean;
  
  /** Кастомный заголовок */
  customTitle?: string;
  
  /** Кастомная иконка заголовка */
  customIcon?: React.ReactNode;
}

// Re-export основных типов из entity для удобства
export type {
  QuickAction,
  ActionGroup,
  ActionsFilters,
  ActionUsageStats,
  UserActionsConfig,
  QuickActionType,
  ActionCategory,
  ActionPriority,
} from "@/features/actions"; 