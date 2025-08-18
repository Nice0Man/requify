/**
 * System Entity Types
 * Вынесены из виджета system-health для соблюдения FSD архитектуры
 */

/**
 * Статус здоровья системы
 */
export type HealthStatus = "healthy" | "warning" | "critical" | "unknown";

/**
 * Тип метрики системы
 */
export type MetricType = 
  | "cpu"
  | "memory"
  | "disk"
  | "network"
  | "database"
  | "api"
  | "response_time"
  | "error_rate"
  | "uptime"
  | "active_users";

/**
 * Единица измерения метрики
 */
export type MetricUnit = "%" | "ms" | "MB" | "GB" | "TB" | "req/s" | "errors/min" | "count";

/**
 * Метрика системы
 */
export interface SystemMetric {
  /** Уникальный идентификатор */
  id: string;
  
  /** Тип метрики */
  type: MetricType;
  
  /** Название метрики */
  name: string;
  
  /** Описание */
  description?: string;
  
  /** Текущее значение */
  value: number;
  
  /** Предыдущее значение (для трендов) */
  previousValue?: number;
  
  /** Максимальное значение */
  maxValue?: number;
  
  /** Единица измерения */
  unit: MetricUnit;
  
  /** Статус метрики */
  status: HealthStatus;
  
  /** Пороговые значения */
  thresholds: {
    warning: number;
    critical: number;
  };
  
  /** Временная метка последнего обновления */
  lastUpdated: Date;
  
  /** Тренд (растет/падает/стабильно) */
  trend?: "up" | "down" | "stable";
  
  /** Процентное изменение */
  changePercent?: number;
  
  /** Цвет метрики */
  color?: string;
  
  /** Иконка метрики */
  icon?: React.ReactNode;
}

/**
 * Сервис системы
 */
export interface SystemService {
  /** Идентификатор сервиса */
  id: string;
  
  /** Название сервиса */
  name: string;
  
  /** Описание сервиса */
  description?: string;
  
  /** Статус сервиса */
  status: HealthStatus;
  
  /** URL для проверки */
  url?: string;
  
  /** Время отклика */
  responseTime?: number;
  
  /** Последняя проверка */
  lastCheck: Date;
  
  /** Время работы */
  uptime?: number;
  
  /** Сообщение об ошибке */
  errorMessage?: string;
  
  /** Версия сервиса */
  version?: string;
  
  /** Зависимости */
  dependencies?: string[];
}

/**
 * Инцидент системы
 */
export interface SystemIncident {
  /** Идентификатор инцидента */
  id: string;
  
  /** Заголовок */
  title: string;
  
  /** Описание */
  description: string;
  
  /** Статус инцидента */
  status: "open" | "investigating" | "identified" | "monitoring" | "resolved";
  
  /** Серьезность */
  severity: "low" | "medium" | "high" | "critical";
  
  /** Затронутые сервисы */
  affectedServices: string[];
  
  /** Время начала */
  startTime: Date;
  
  /** Время окончания */
  endTime?: Date;
  
  /** Обновления инцидента */
  updates: Array<{
    time: Date;
    message: string;
    author: string;
  }>;
}

/**
 * Общее состояние системы
 */
export interface SystemHealthOverview {
  /** Общий статус */
  overallStatus: HealthStatus;
  
  /** Время работы системы */
  uptime: number;
  
  /** Общее количество сервисов */
  totalServices: number;
  
  /** Количество здоровых сервисов */
  healthyServices: number;
  
  /** Активные инциденты */
  activeIncidents: number;
  
  /** Последнее обновление */
  lastUpdated: Date;
  
  /** Сообщение о состоянии */
  statusMessage?: string;
}

/**
 * DTO типы для API
 */
export interface SystemMetricDTO {
  id: string;
  type: string;
  name: string;
  description?: string;
  value: number;
  previous_value?: number;
  max_value?: number;
  unit: string;
  status: string;
  warning_threshold: number;
  critical_threshold: number;
  last_updated: string;
  trend?: string;
  change_percent?: number;
  color?: string;
}

export interface SystemServiceDTO {
  id: string;
  name: string;
  description?: string;
  status: string;
  url?: string;
  response_time?: number;
  last_check: string;
  uptime?: number;
  error_message?: string;
  version?: string;
  dependencies?: string[];
}

export interface SystemIncidentDTO {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  affected_services: string[];
  start_time: string;
  end_time?: string;
  updates: Array<{
    time: string;
    message: string;
    author: string;
  }>;
}

export interface SystemHealthOverviewDTO {
  overall_status: string;
  uptime: number;
  total_services: number;
  healthy_services: number;
  active_incidents: number;
  last_updated: string;
  status_message?: string;
}

/**
 * Запросы для фильтрации
 */
export interface SystemHealthFilters {
  /** Статусы для отображения */
  statuses?: HealthStatus[];
  
  /** Типы метрик */
  metricTypes?: MetricType[];
  
  /** Сервисы */
  services?: string[];
  
  /** Временной диапазон */
  timeRange?: {
    from: Date;
    to: Date;
  };
  
  /** Только активные инциденты */
  activeIncidentsOnly?: boolean;
  
  /** Минимальная серьезность */
  minSeverity?: "low" | "medium" | "high" | "critical";
}

/**
 * Ответы API
 */
export interface SystemMetricsResponse {
  metrics: SystemMetricDTO[];
  total: number;
  last_updated: string;
}

export interface SystemServicesResponse {
  services: SystemServiceDTO[];
  total: number;
  last_updated: string;
}

export interface SystemIncidentsResponse {
  incidents: SystemIncidentDTO[];
  total: number;
  active_count: number;
}

export interface SystemHealthResponse {
  overview: SystemHealthOverviewDTO;
  metrics: SystemMetricDTO[];
  services: SystemServiceDTO[];
  incidents: SystemIncidentDTO[];
} 