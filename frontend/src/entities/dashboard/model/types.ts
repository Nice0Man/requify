import type { GridSize } from "@mui/material";
import React from "react";
import type { ActivityItem } from "@/shared/types/activity";

// === Core Dashboard Types ===

/**
 * Режимы отображения дашборда
 */
export type DashboardMode = "minimal" | "compact" | "detailed" | "fullscreen";

/**
 * Типы layout дашборда
 */
export type DashboardLayoutType = "grid" | "list" | "masonry" | "default";

/**
 * Плотность отображения
 */
export type DashboardDensity = "compact" | "comfortable" | "dense";

// === Dashboard Widget Configuration ===

/**
 * Конфигурация виджета дашборда (унифицированная)
 */
export interface DashboardWidget {
  /** Уникальный идентификатор виджета */
  id: string;

  /** React компонент виджета */
  component: React.ComponentType<any>;

  /** Приоритет отображения */
  priority: number;

  /** Размер виджета */
  size: "small" | "medium" | "large";

  /** Пропсы для компонента */
  props: Record<string, any>;

  /** Размеры сетки для разных экранов */
  gridSize: {
    xs: GridSize;
    sm: GridSize;
    md: GridSize;
    lg: GridSize;
    xl: GridSize;
  };

  /** Видимость в разных режимах */
  visible: {
    minimal: boolean;
    compact: boolean;
    detailed: boolean;
    fullscreen: boolean;
  };

  /** Тип виджета для группировки */
  type?: WidgetType;

  /** Заголовок виджета */
  title?: string;

  /** Описание виджета */
  description?: string;

  /** Состояние загрузки */
  isLoading?: boolean;

  /** Ошибка виджета */
  error?: string;
}

// === Dashboard Metrics ===

export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "stable";
  icon?: string;
  color?: string;
  description?: string;
  category?: MetricCategory;
  unit?: string;
  target?: number;
  lastUpdated?: string;
}

export interface DashboardStats {
  totalProjects?: number;
  activeProjects?: number;
  completedProjects?: number;
  totalRequirements?: number;
  activeRequirements?: number; // Добавляю недостающее свойство
  pendingRequirements?: number;
  approvedRequirements?: number;
  totalUsers?: number;
  activeUsers?: number;
  totalReleases: number;
  activeReleases: number;
  totalTestCases: number;
  passedTestCases: number;

  // Performance metrics
  avgResponseTime: number;
  systemUptime: number;
  errorRate: number;

  // Trends
  trends?: {
    totalProjects?: TrendData;
    activeProjects?: TrendData;
    completedProjects?: TrendData;
    totalRequirements?: TrendData;
    activeRequirements?: TrendData; // Добавляю недостающее свойство
    pendingRequirements?: TrendData;
    approvedRequirements?: TrendData;
    totalUsers?: TrendData;
    activeUsers?: TrendData;
  };

  // Changes
  changes?: {
    totalProjects?: number;
    activeProjects?: number;
    completedProjects?: number;
    totalRequirements?: number;
    pendingRequirements?: number;
    approvedRequirements?: number;
    totalUsers?: number;
    activeUsers?: number;
  };
}

// === Activity & Timeline ===
// ActivityItem теперь импортируется из widgets/activity-feed для унификации

export interface ActivityResponse {
  items: ActivityItem[];
  data?: ActivityItem[];
  total: number;
  hasMore: boolean;
  cursor?: string;
  page?: number; // Добавляю недостающее свойство
}

export interface ActivityFilters {
  type?: ActivityType[];
  user?: string[];
  userId?: string; // Добавляю недостающее свойство
  startDate?: string;
  endDate?: string;
  dateFrom?: string; // Добавляю недостающее свойство
  dateTo?: string; // Добавляю недостающее свойство
  status?: string; // Добавляю недостающее свойство
  priority?: string[];
  read?: boolean;
  limit?: number;
  cursor?: string;
  offset?: number; // Добавляю недостающее свойство
}

// === Quick Actions ===

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: ActionCategory;
  priority: number;
  enabled: boolean;
  permissions: string[];
  action: () => void | Promise<void>;
  shortcut?: string;
  path?: string; // Добавляю недостающее свойство
  badge?: {
    text: string;
    color: string;
  };
}

// === System Health ===

export interface SystemHealth {
  status: "healthy" | "warning" | "error";
  uptime: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  services: SystemService[];
  lastCheck: string;
  activeUsers?: number; // Добавляю недостающее свойство
}

export interface SystemService {
  name: string;
  status: "online" | "offline" | "degraded";
  responseTime?: number;
  lastCheck: string;
  errorMessage?: string;
}

// === Data Filtering ===

export interface MetricsFilters {
  period?: ChartData[];
  category?: MetricCategory[];
  projects?: string[];
  users?: string[];
  status?: string[];
  includeComparisons?: boolean;
}

export interface DashboardPreferences {
  layout: DashboardLayoutType;
  density: DashboardDensity;
  theme: "light" | "dark" | "auto";
  widgets: {
    order: string[];
    hidden: string[];
    sizes: Record<string, "small" | "medium" | "large">;
  };
  autoRefresh: boolean;
  refreshInterval: number;
}

// === Chart Data ===

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  timeline?: any; // Добавляю недостающее свойство
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface TimelineDataPoint {
  date: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface DistributionDataPoint {
  label: string;
  value: number;
  percentage: number;
  color?: string;
}

// === System Metrics ===

export interface DashboardSystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    frequency: number;
  };
  memory: {
    used: number;
    total: number;
    available: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    available: number;
    usage: number;
  };
  network: {
    in: number;
    out: number;
    latency: number;
  };
  services: SystemService[];
  database: {
    connections: number;
    queryTime: number;
    status: "healthy" | "warning" | "error";
  };
  cache: {
    hitRate: number;
    size: number;
    status: "healthy" | "warning" | "error";
  };
  // Добавляю недостающие свойства
  cpuUsage?: number;
}

// === Enums ===

export enum WidgetType {
  METRICS = "metrics",
  CHART = "chart",
  LIST = "list",
  ACTIVITY = "activity",
  QUICK_ACTIONS = "quick_actions",
  SYSTEM_HEALTH = "system_health",
  CALENDAR = "calendar",
  PROGRESS = "progress",
}

export enum WidgetSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  XLARGE = "xlarge",
}

export enum MetricCategory {
  PROJECTS = "projects",
  REQUIREMENTS = "requirements",
  USERS = "users",
  RELEASES = "releases",
  TESTING = "testing",
  PERFORMANCE = "performance",
  SYSTEM = "system",
}

export enum ActivityType {
  PROJECT_CREATED = "project_created",
  PROJECT_UPDATED = "project_updated",
  REQUIREMENT_CREATED = "requirement_created",
  REQUIREMENT_UPDATED = "requirement_updated",
  REQUIREMENT_APPROVED = "requirement_approved",
  USER_JOINED = "user_joined",
  USER_LEFT = "user_left",
  RELEASE_CREATED = "release_created",
  RELEASE_PUBLISHED = "release_published",
  TEST_PASSED = "test_passed",
  TEST_FAILED = "test_failed",
  COMMENT_ADDED = "comment_added",
  FILE_UPLOADED = "file_uploaded",
  SYSTEM_ERROR = "system_error",
  BACKUP_COMPLETED = "backup_completed",
}

export enum ActionCategory {
  PROJECT = "project",
  REQUIREMENT = "requirement",
  USER = "user",
  RELEASE = "release",
  TESTING = "testing",
  SYSTEM = "system",
  REPORT = "report",
  CREATE = "create",
  ANALYZE = "analyze",
  MANAGE = "manage", // Добавляю недостающее значение
}

export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  PROJECT_UPDATES = "project_updates", // Добавляю недостающее значение
}

export enum DashboardView {
  OVERVIEW = "overview",
  PROJECTS = "projects",
  REQUIREMENTS = "requirements",
  USERS = "users",
  RELEASES = "releases",
  TESTING = "testing",
  SYSTEM = "system",
}

// === Helper Types ===

export interface TrendData {
  current?: number;
  previous?: number;
  change?: number;
  changePercent?: number;
  percentage?: number;
  direction?: "up" | "down" | "stable"; // Добавляю недостающее свойство
  trend?: "up" | "down" | "stable";
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: Array<{
    id: string;
    position: { x: number; y: number; w: number; h: number };
  }>;
  columns?: number; // Добавляю недостающее свойство
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string; // Добавляю недостающее свойство
}

// === Base Widget Props (для всех виджетов) ===

export interface BaseWidgetProps {
  /** Режим отображения дашборда */
  mode: DashboardMode;

  /** Макет дашборда */
  layout: DashboardLayoutType;

  /** Плотность элементов */
  density: DashboardDensity;

  /** CSS классы */
  className?: string;

  /** Состояние загрузки */
  isLoading?: boolean;

  /** Обработчик клика по виджету */
  onClick?: (widgetId: string) => void;

  /** Обработчик изменения размера */
  onResize?: (size: "small" | "medium" | "large" | "xlarge" | "auto") => void;

  /** Обработчик свертывания */
  onCollapse?: () => void;

  /** ID виджета для отслеживания */
  widgetId?: string;

  /** Дополнительные данные для виджета */
  data?: unknown;

  /** Обработчик ошибок */
  onError?: (error: Error) => void;
}
