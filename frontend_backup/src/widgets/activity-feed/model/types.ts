import type { BaseWidgetProps } from "@/shared/types/dashboard";

// Импортируем типы активности из shared
import type {
  ActivityType,
  ActivityPriority,
  ActivityStatus,
  ActivityItem,
  ActivityFilters,
} from "@/shared/types/activity";

// Реэкспортируем для обратной совместимости
export type {
  ActivityType,
  ActivityPriority,
  ActivityStatus,
  ActivityItem,
  ActivityFilters,
};

/**
 * Настройки группировки активности
 */
export interface ActivityGrouping {
  /** Группировать по */
  groupBy: "date" | "type" | "priority" | "author" | "project" | "none";

  /** Сортировка внутри групп */
  sortWithinGroups: "timestamp" | "priority" | "alphabetical";

  /** Порядок сортировки */
  sortOrder: "asc" | "desc";
}

/**
 * Конфигурация отображения активности
 */
export interface ActivityDisplayConfig {
  /** Показывать аватары */
  showAvatars: boolean;

  /** Показывать временные метки */
  showTimestamps: boolean;

  /** Показывать приоритеты */
  showPriorities: boolean;

  /** Показывать статусы */
  showStatuses: boolean;

  /** Показывать связанные сущности */
  showRelatedEntities: boolean;

  /** Показывать теги */
  showTags: boolean;

  /** Компактный режим */
  compact: boolean;

  /** Максимальная длина описания */
  maxDescriptionLength: number;

  /** Показывать кнопки действий */
  showActions: boolean;
}

/**
 * Пропы для ActivityFeedWidget
 */
export interface ActivityFeedWidgetProps extends BaseWidgetProps {
  maxItems?: number;
  showFilters?: boolean;
  refreshInterval?: number;
  data?: ActivityItem[];
  isDataLoading?: boolean;
  dataError?: Error | null;
  onRefresh?: () => void;

  // Добавляю недостающие свойства
  infiniteScroll?: boolean;
  showSearch?: boolean;
  autoRefreshInterval?: number;
  filters?: ActivityFilters;
  displayConfig?: any;
  onItemClick?: (item: ActivityItem) => void;
  onUndoAction?: (item: ActivityItem) => void;
  onFiltersChange?: (filters: ActivityFilters) => void;
  className?: string;
  sx?: any;
}
