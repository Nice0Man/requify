/**
 * Dashboard Stats Widget Types
 * Типы для виджета статистики дашборда
 */

export interface DashboardStats {
  totalProjects: number;
  activeRequirements: number;
  completedTests: number;
  pendingReleases: number;
  [key: string]: number | string;
}

export interface DashboardStatsFilters {
  timeRange?: 'day' | 'week' | 'month' | 'year';
  projectIds?: string[];
  includeArchived?: boolean;
}

export interface DashboardStatsMetric {
  id: string;
  label: string;
  value: number | string;
  icon?: string;
  color?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

/**
 * FSD Dashboard Stats Widget Types
 * Прогресс: [✅] Создан унифицированный тип для виджета статистики
 * TODO: [ ] Интегрировать с API_ENDPOINTS
 */

import type { 
  DashboardMode, 
  DashboardLayoutType as DashboardLayout, 
  DashboardDensity 
} from "@/widgets/types";

/**
 * Направление тренда метрики
 */
export type TrendDirection = "up" | "down" | "neutral";

/**
 * Тип метрики
 */
export type MetricType = 
  | "count" 
  | "percentage" 
  | "currency" 
  | "time" 
  | "rating" 
  | "progress" 
  | "trend" 
  | "custom";

/**
 * Тренд метрики
 */
export interface MetricTrend {
  /** Значение изменения в процентах */
  value: number;
  /** Направление тренда */
  direction: TrendDirection;
  /** Подпись для тренда */
  label: string;
  /** Период для сравнения */
  period?: string;
}

/**
 * Метаданные метрики
 */
export interface MetricMetadata {
  /** Целевое значение */
  target?: number;
  /** Единица измерения */
  unit?: string;
  /** Описание метрики */
  description?: string;
  /** Цвет метрики */
  color?: string;
  /** Категория метрики */
  category?: string;
  /** Приоритет отображения */
  priority?: number;
}

/**
 * Данные метрики
 */
export interface DashboardMetric {
  /** Уникальный идентификатор */
  id: string;
  /** Название метрики */
  title: string;
  /** Значение метрики */
  value: number | string;
  /** Иконка метрики */
  icon: React.ReactElement;
  /** Тип метрики */
  type: MetricType;
  /** Тренд (опционально) */
  trend?: MetricTrend;
  /** Прогресс от 0 до 1 (опционально) */
  progress?: number;
  /** Метаданные */
  metadata?: MetricMetadata;
  /** Функция форматирования значения */
  formatValue?: (value: number | string) => string;
  /** Показывать ли метрику */
  visible?: boolean;
}

/**
 * Группа метрик
 */
export interface MetricGroup {
  /** Идентификатор группы */
  id: string;
  /** Название группы */
  title: string;
  /** Описание группы */
  description?: string;
  /** Метрики в группе */
  metrics: DashboardMetric[];
  /** Свернута ли группа */
  collapsed?: boolean;
}

/**
 * Конфигурация отображения
 */
export interface DisplayConfig {
  /** Вариант отображения */
  variant: "minimal" | "compact" | "detailed";
  /** Показывать ли тренды */
  showTrends: boolean;
  /** Показывать ли процентные изменения */
  showPercentageChange: boolean;
  /** Показывать ли прогресс бары */
  showProgress: boolean;
  /** Показывать ли описания */
  showDescriptions: boolean;
  /** Анимации */
  animations: boolean;
  /** Количество колонок */
  columns: number;
  /** Максимальное количество метрик */
  maxMetrics: number;
  /** Группировать ли по категориям */
  groupByCategory: boolean;
  /** Компактный режим */
  compact: boolean;
  /** Автообновление */
  autoRefresh: boolean;
  /** Интервал обновления в секундах */
  refreshInterval: number;
  /** Формат чисел */
  numberFormat: "standard" | "compact" | "scientific";
  /** Показывать только избранные */
  showFavoritesOnly: boolean;
}

/**
 * Фильтры метрик
 */
export interface MetricFilters {
  /** Фильтр по категориям */
  categories?: string[];
  /** Фильтр по типам */
  types?: MetricType[];
  /** Фильтр по трендам */
  trends?: TrendDirection[];
  /** Поисковый запрос */
  search?: string;
  /** Показывать только видимые */
  visibleOnly?: boolean;
}

/**
 * Конфигурация сравнения метрик
 */
export interface MetricComparison {
  /** Период сравнения */
  period: "week" | "month" | "quarter" | "year";
  /** Базовая дата для сравнения */
  baseDate?: Date;
  /** Показывать абсолютные изменения */
  showAbsolute: boolean;
  /** Показывать процентные изменения */
  showPercentage: boolean;
}

/**
 * Состояние ошибки
 */
export interface ErrorState {
  /** Сообщение об ошибке */
  message: string;
  /** Код ошибки */
  code?: string;
  /** Детали ошибки */
  details?: Record<string, any>;
}

/**
 * Пропсы виджета статистики дашборда
 */
export interface DashboardStatsWidgetProps {
  // === Основные настройки дашборда ===
  /** Режим дашборда */
  mode?: DashboardMode;
  /** Макет дашборда */
  layout?: DashboardLayout;
  /** Плотность дашборда */
  density?: DashboardDensity;

  // === Данные ===
  /** Метрики для отображения */
  metrics?: DashboardMetric[];
  /** Группы метрик */
  groups?: MetricGroup[];
  /** Избранные метрики */
  favoriteMetrics?: string[];

  // === Конфигурация отображения ===
  /** Конфигурация отображения */
  displayConfig?: Partial<DisplayConfig>;
  /** Фильтры */
  filters?: MetricFilters;
  /** Настройки сравнения */
  comparison?: MetricComparison;

  // === Состояние загрузки ===
  /** Загружаются ли данные */
  isDataLoading?: boolean;
  /** Ошибка загрузки данных */
  dataError?: ErrorState | null;

  // === Обработчики событий ===
  /** Обновление данных */
  onRefresh?: () => Promise<void>;
  /** Клик по метрике */
  onMetricClick?: (metricId: string, metric: DashboardMetric) => void;
  /** Переключение избранного */
  onToggleFavorite?: (metricId: string) => void;
  /** Экспорт данных */
  onExport?: (format: "csv" | "xlsx" | "pdf") => void;
  /** Настройки виджета */
  onSettings?: () => void;

  // === UI опции ===
  /** Показывать ли кнопку настроек */
  showSettings?: boolean;
  /** Показывать ли кнопку экспорта */
  showExport?: boolean;
  /** Пользовательский заголовок */
  customTitle?: string;
  /** Пользовательская иконка */
  customIcon?: React.ReactElement;

  // === Стандартные React пропсы ===
  /** CSS класс */
  className?: string;
  /** Стили */
  sx?: Record<string, any>;
}

/**
 * Результат хука для управления метриками
 */
export interface UseMetricsResult {
  /** Отфильтрованные и отсортированные метрики */
  filteredMetrics: DashboardMetric[];
  /** Группированные метрики */
  groupedMetrics: MetricGroup[];
  /** Загружаются ли данные */
  isLoading: boolean;
  /** Ошибка */
  error: ErrorState | null;
  /** Обновление данных */
  refetch: () => Promise<void>;
  /** Переключение избранного */
  toggleFavorite: (metricId: string) => void;
  /** Применение фильтров */
  applyFilters: (filters: MetricFilters) => void;
}

/**
 * Конфигурация Context7 для виджета
 */
export interface Context7WidgetConfig {
  /** ID виджета для Context7 */
  widgetId: string;
  /** Версия API */
  apiVersion: string;
  /** Настройки кеширования */
  caching: {
    enabled: boolean;
    ttl: number;
  };
  /** Настройки обновления */
  refresh: {
    auto: boolean;
    interval: number;
  };
} 