/**
 * Shared Activity Types
 * Типы активности вынесены в shared для переиспользования в entities и widgets
 */

/**
 * Тип активности в системе
 */
export type ActivityType =
  | "requirement_created"
  | "requirement_updated"
  | "requirement_deleted"
  | "project_created"
  | "project_updated"
  | "release_published"
  | "user_joined"
  | "comment_added"
  | "test_executed"
  | "status_changed"
  // Простые типы для совместимости
  | "project"
  | "requirement"
  | "release"
  | "user"
  | "testing";

/**
 * Приоритет активности
 */
export type ActivityPriority = "low" | "medium" | "high" | "critical";

/**
 * Статус активности
 */
export type ActivityStatus = "pending" | "in_progress" | "completed" | "failed";

/**
 * Элемент активности (базовый тип)
 */
export interface ActivityItem {
  /** Уникальный идентификатор */
  id: string;

  /** Тип активности */
  type: ActivityType;

  /** Заголовок активности */
  title: string;

  /** Описание активности */
  description?: string;

  /** Автор активности */
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };

  /** Временная метка */
  timestamp: Date;

  /** Приоритет */
  priority: ActivityPriority;

  /** Статус */
  status: ActivityStatus;

  /** Связанные сущности */
  relatedEntities?: Array<{
    type: "project" | "requirement" | "release" | "user";
    id: string;
    name: string;
  }>;

  /** Метаданные */
  metadata?: Record<string, any>;

  /** Теги */
  tags?: string[];

  /** Можно ли отменить действие */
  isUndoable?: boolean;

  /** URL для перехода к связанной сущности */
  actionUrl?: string;
}

/**
 * Фильтры для активности
 */
export interface ActivityFilters {
  /** Типы активности */
  types?: ActivityType[];

  /** Приоритеты */
  priorities?: ActivityPriority[];

  /** Статусы */
  statuses?: ActivityStatus[];

  /** Авторы */
  authors?: string[];

  /** Диапазон дат */
  dateRange?: {
    from: Date;
    to: Date;
  };

  /** Связанные проекты */
  projects?: string[];

  /** Теги */
  tags?: string[];

  /** Поисковый запрос */
  searchQuery?: string;
}

/**
 * Ответ API для активности
 */
export interface ActivityResponse {
  items: ActivityItem[];
  data?: ActivityItem[];
  total: number;
  hasMore: boolean;
  cursor?: string;
  page?: number;
} 