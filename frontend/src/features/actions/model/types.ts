/**
 * Actions Entity Types
 * Вынесены из виджета quick-actions для соблюдения FSD архитектуры
 */

/**
 * Тип быстрого действия
 */
export type QuickActionType =
  | "create_requirement"
  | "create_project"
  | "create_release"
  | "add_user"
  | "run_test"
  | "generate_report"
  | "export_data"
  | "sync_data"
  | "backup"
  | "settings"
  | "custom";

/**
 * Категория действий
 */
export type ActionCategory =
  | "creation"
  | "management"
  | "analysis"
  | "integration"
  | "administration"
  | "favorites";

/**
 * Приоритет действия
 */
export type ActionPriority = "low" | "medium" | "high" | "featured";

/**
 * Быстрое действие
 */
export interface QuickAction {
  /** Уникальный идентификатор */
  id: string;

  /** Тип действия */
  type: QuickActionType;

  /** Заголовок действия */
  title: string;

  /** Описание действия */
  description?: string;

  /** Иконка действия */
  icon?: React.ReactNode;

  /** Категория */
  category: ActionCategory;

  /** Приоритет */
  priority: ActionPriority;

  /** Активно ли действие */
  enabled: boolean;

  /** Роли, которые могут выполнить действие */
  allowedRoles?: string[];

  /** URL для перехода */
  url?: string;

  /** Функция-обработчик */
  handler?: () => void | Promise<void>;

  /** Горячие клавиши */
  shortcut?: string;

  /** Цвет действия */
  color?: string;

  /** Порядок отображения */
  order?: number;

  /** Метаданные */
  metadata?: Record<string, any>;

  /** Дата создания */
  createdAt: Date;

  /** Дата последнего использования */
  lastUsedAt?: Date;

  /** Количество использований */
  usageCount: number;
}

/**
 * Группа действий
 */
export interface ActionGroup {
  /** Идентификатор группы */
  id: string;

  /** Название группы */
  name: string;

  /** Описание группы */
  description?: string;

  /** Иконка группы */
  icon?: React.ReactNode;

  /** Действия в группе */
  actions: QuickAction[];

  /** Цвет группы */
  color?: string;

  /** Порядок отображения */
  order?: number;

  /** Сворачиваемая ли группа */
  collapsible?: boolean;

  /** Свернута ли по умолчанию */
  defaultCollapsed?: boolean;
}

/**
 * Статистика использования действий
 */
export interface ActionUsageStats {
  /** ID действия */
  actionId: string;

  /** Общее количество использований */
  totalUsage: number;

  /** Использований за последний день */
  dailyUsage: number;

  /** Использований за последнюю неделю */
  weeklyUsage: number;

  /** Использований за последний месяц */
  monthlyUsage: number;

  /** Последнее использование */
  lastUsed?: Date;

  /** Средняя частота использования */
  averageFrequency: number;

  /** Тренд использования */
  trend: "up" | "down" | "stable";
}

/**
 * Фильтры для действий
 */
export interface ActionsFilters {
  /** Категории */
  categories?: ActionCategory[];

  /** Типы действий */
  types?: QuickActionType[];

  /** Приоритеты */
  priorities?: ActionPriority[];

  /** Только включенные */
  enabledOnly?: boolean;

  /** Только избранные */
  favoritesOnly?: boolean;

  /** Поисковый запрос */
  searchQuery?: string;

  /** Фильтр по ролям */
  allowedForRole?: string;

  /** Минимальное количество использований */
  minUsageCount?: number;

  /** Использованные за период */
  usedSince?: Date;
}

/**
 * Конфигурация действий пользователя
 */
export interface UserActionsConfig {
  /** ID пользователя */
  userId: string;

  /** Избранные действия */
  favoriteActions: string[];

  /** Скрытые действия */
  hiddenActions: string[];

  /** Кастомный порядок действий */
  customOrder?: Record<string, number>;

  /** Кастомные группы */
  customGroups?: ActionGroup[];

  /** Настройки отображения */
  displaySettings: {
    showIcons: boolean;
    showDescriptions: boolean;
    showShortcuts: boolean;
    compactMode: boolean;
    groupByCategory: boolean;
  };

  /** Последнее обновление */
  lastUpdated: Date;
}

/**
 * DTO типы для API
 */
export interface QuickActionDTO {
  id: string;
  type: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  enabled: boolean;
  allowed_roles?: string[];
  url?: string;
  shortcut?: string;
  color?: string;
  order?: number;
  metadata?: Record<string, any>;
  created_at: string;
  last_used_at?: string;
  usage_count: number;
}

export interface ActionGroupDTO {
  id: string;
  name: string;
  description?: string;
  actions: QuickActionDTO[];
  color?: string;
  order?: number;
  collapsible?: boolean;
  default_collapsed?: boolean;
}

export interface ActionUsageStatsDTO {
  action_id: string;
  total_usage: number;
  daily_usage: number;
  weekly_usage: number;
  monthly_usage: number;
  last_used?: string;
  average_frequency: number;
  trend: string;
}

export interface UserActionsConfigDTO {
  user_id: string;
  favorite_actions: string[];
  hidden_actions: string[];
  custom_order?: Record<string, number>;
  custom_groups?: ActionGroupDTO[];
  display_settings: {
    show_icons: boolean;
    show_descriptions: boolean;
    show_shortcuts: boolean;
    compact_mode: boolean;
    group_by_category: boolean;
  };
  last_updated: string;
}

/**
 * Ответы API
 */
export interface ActionsResponse {
  actions: QuickActionDTO[];
  groups: ActionGroupDTO[];
  total: number;
}

export interface ActionStatsResponse {
  stats: ActionUsageStatsDTO[];
  total: number;
}

export interface UserConfigResponse {
  config: UserActionsConfigDTO;
}
