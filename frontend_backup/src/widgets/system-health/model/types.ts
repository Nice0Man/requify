import type {
  SystemHealthOverview,
  SystemMetric,
  SystemService,
  SystemIncident,
  SystemHealthFilters,
} from "@/entities/system";
import type { BaseWidgetProps } from "@/shared/types/dashboard";

/**
 * Конфигурация отображения виджета здоровья системы
 */
export interface SystemHealthDisplayConfig {
  /** Показывать общий статус */
  showOverallStatus: boolean;

  /** Показывать метрики */
  showMetrics: boolean;

  /** Показывать сервисы */
  showServices: boolean;

  /** Показывать инциденты */
  showIncidents: boolean;

  /** Максимальное количество метрик */
  maxMetrics: number;

  /** Максимальное количество сервисов */
  maxServices: number;

  /** Максимальное количество инцидентов */
  maxIncidents: number;

  /** Показывать тренды */
  showTrends: boolean;

  /** Показывать время отклика */
  showResponseTimes: boolean;

  /** Автообновление */
  autoRefresh: boolean;

  /** Интервал автообновления (секунды) */
  refreshInterval: number;

  /** Компактный режим */
  compact: boolean;

  /** Группировать по типам */
  groupByType: boolean;

  /** Показывать только критичные */
  showCriticalOnly: boolean;
}

/**
 * Пропы для SystemHealthWidget
 * Теперь использует типы из system entity
 */
export interface SystemHealthWidgetProps extends BaseWidgetProps {
  /** Общий обзор системы */
  overview?: SystemHealthOverview;

  /** Метрики системы */
  metrics?: SystemMetric[];

  /** Сервисы системы */
  services?: SystemService[];

  /** Инциденты */
  incidents?: SystemIncident[];

  /** Конфигурация отображения */
  displayConfig?: Partial<SystemHealthDisplayConfig>;

  /** Фильтры */
  filters?: SystemHealthFilters;

  /** Загрузка данных */
  isDataLoading?: boolean;

  /** Ошибка загрузки */
  dataError?: Error | null;

  /** Обработчик обновления */
  onRefresh?: () => void;

  /** Обработчик клика по метрике */
  onMetricClick?: (metric: SystemMetric) => void;

  /** Обработчик клика по сервису */
  onServiceClick?: (service: SystemService) => void;

  /** Обработчик клика по инциденту */
  onIncidentClick?: (incident: SystemIncident) => void;

  /** Обработчик изменения фильтров */
  onFiltersChange?: (filters: SystemHealthFilters) => void;

  /** Обработчик настроек */
  onSettings?: () => void;

  /** Показывать настройки */
  showSettings?: boolean;

  /** Кастомный заголовок */
  customTitle?: string;

  refreshInterval?: number;
  showDetails?: boolean;
  variant?: string;
  className?: string;
  alertThresholds?: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

// Re-export основных типов из entity для удобства
export type {
  SystemHealthOverview,
  SystemMetric,
  SystemService,
  SystemIncident,
  SystemHealthFilters,
  HealthStatus,
  MetricType,
  MetricUnit,
} from "@/entities/system";
