/**
 * Navigation Entity Types
 * Консолидация логики навигации из features и виджетов по FSD архитектуре
 */

/**
 * Тип элемента навигации
 */
export type NavigationItemType = 
  | "page" 
  | "section" 
  | "action" 
  | "external" 
  | "separator"
  | "group";

/**
 * Статус элемента навигации
 */
export type NavigationItemStatus = 
  | "active" 
  | "inactive" 
  | "disabled" 
  | "hidden"
  | "beta"
  | "new";

/**
 * Роли доступа к элементу навигации
 */
export type NavigationRole = 
  | "admin"
  | "project_manager" 
  | "analyst"
  | "developer"
  | "tester"
  | "viewer"
  | "guest";

/**
 * Элемент навигации
 */
export interface NavigationItem {
  /** Уникальный идентификатор */
  id: string;
  
  /** Тип элемента */
  type: NavigationItemType;
  
  /** Заголовок */
  title: string;
  
  /** Описание (для подсказок) */
  description?: string;
  
  /** Путь для роутинга */
  path?: string;
  
  /** Внешняя ссылка */
  externalUrl?: string;
  
  /** Иконка */
  icon?: React.ReactNode;
  
  /** Цвет элемента */
  color?: string;
  
  /** Бейдж (уведомления, счетчики) */
  badge?: {
    count?: number;
    text?: string;
    color?: string;
    variant?: "default" | "danger" | "warning" | "success" | "info";
  };
  
  /** Статус элемента */
  status: NavigationItemStatus;
  
  /** Дочерние элементы */
  children?: NavigationItem[];
  
  /** Родительский элемент */
  parentId?: string;
  
  /** Порядок сортировки */
  order: number;
  
  /** Роли доступа */
  allowedRoles?: NavigationRole[];
  
  /** Требуется ли аутентификация */
  requiresAuth?: boolean;
  
  /** Горячие клавиши */
  shortcut?: string;
  
  /** Метаданные для расширения */
  metadata?: Record<string, any>;
  
  /** Можно ли перетаскивать */
  isDraggable?: boolean;
  
  /** Скрыт ли в компактном режиме */
  hideInCompact?: boolean;
  
  /** Группа элементов */
  group?: string;
  
  /** Дата создания */
  createdAt: Date;
  
  /** Дата последнего обновления */
  updatedAt: Date;
}

/**
 * Элемент хлебных крошек
 */
export interface BreadcrumbItem {
  /** Идентификатор */
  id: string;
  
  /** Заголовок */
  title: string;
  
  /** Путь (опционально для последнего элемента) */
  path?: string;
  
  /** Иконка */
  icon?: React.ReactNode;
  
  /** Метаданные */
  metadata?: Record<string, any>;
}

/**
 * Конфигурация боковой панели
 */
export interface SidebarConfig {
  /** Ширина в развернутом состоянии */
  width: number;
  
  /** Ширина в свернутом состоянии */
  collapsedWidth: number;
  
  /** Длительность анимации */
  animationDuration: number;
  
  /** Сохранять ли порядок элементов */
  persistOrder: boolean;
  
  /** Сохранять ли состояние сворачивания */
  persistCollapse: boolean;
  
  /** Автоматически сворачивать на мобильных */
  autoCollapseOnMobile: boolean;
  
  /** Показывать ли тултипы в свернутом режиме */
  showTooltipsWhenCollapsed: boolean;
  
  /** Разрешить ли drag & drop */
  allowReordering: boolean;
  
  /** Группировать ли элементы */
  groupItems: boolean;
}

/**
 * Состояние навигации
 */
export interface NavigationState {
  /** Элементы навигации */
  items: NavigationItem[];
  
  /** Активный элемент */
  activeItemId: string | null;
  
  /** Развернутые элементы (для групп) */
  expandedItems: string[];
  
  /** Хлебные крошки */
  breadcrumbs: BreadcrumbItem[];
  
  /** Состояние боковой панели */
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
    isPinned: boolean;
    isMobile: boolean;
  };
  
  /** Порядок элементов (для DnD) */
  itemOrder: string[];
  
  /** Избранные элементы */
  favoriteItems: string[];
  
  /** Недавно использованные */
  recentItems: string[];
  
  /** Загрузка */
  isLoading: boolean;
  
  /** Ошибка */
  error: string | null;
}

/**
 * Фильтры для навигации
 */
export interface NavigationFilters {
  /** Поиск по названию */
  searchQuery?: string;
  
  /** Фильтр по типам */
  types?: NavigationItemType[];
  
  /** Фильтр по статусам */
  statuses?: NavigationItemStatus[];
  
  /** Фильтр по ролям */
  allowedForRoles?: NavigationRole[];
  
  /** Показывать только избранные */
  favoritesOnly?: boolean;
  
  /** Показывать только недавние */
  recentOnly?: boolean;
  
  /** Фильтр по группам */
  groups?: string[];
  
  /** Показывать скрытые */
  showHidden?: boolean;
}

/**
 * Настройки пользователя для навигации
 */
export interface UserNavigationPreferences {
  /** ID пользователя */
  userId: string;
  
  /** Избранные элементы */
  favoriteItems: string[];
  
  /** Скрытые элементы */
  hiddenItems: string[];
  
  /** Кастомный порядок */
  customOrder?: string[];
  
  /** Настройки sidebar */
  sidebarPreferences: {
    isCollapsed: boolean;
    isPinned: boolean;
    width?: number;
  };
  
  /** Настройки отображения */
  displayPreferences: {
    showIcons: boolean;
    showBadges: boolean;
    showDescriptions: boolean;
    compactMode: boolean;
    groupByCategory: boolean;
  };
  
  /** Последнее обновление */
  lastUpdated: Date;
}

/**
 * DTO типы для API
 */
export interface NavigationItemDTO {
  id: string;
  type: string;
  title: string;
  description?: string;
  path?: string;
  external_url?: string;
  icon?: string;
  color?: string;
  badge?: {
    count?: number;
    text?: string;
    color?: string;
    variant?: string;
  };
  status: string;
  children?: NavigationItemDTO[];
  parent_id?: string;
  order: number;
  allowed_roles?: string[];
  requires_auth?: boolean;
  shortcut?: string;
  metadata?: Record<string, any>;
  is_draggable?: boolean;
  hide_in_compact?: boolean;
  group?: string;
  created_at: string;
  updated_at: string;
}

export interface BreadcrumbItemDTO {
  id: string;
  title: string;
  path?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface NavigationStateDTO {
  items: NavigationItemDTO[];
  active_item_id: string | null;
  expanded_items: string[];
  breadcrumbs: BreadcrumbItemDTO[];
  sidebar: {
    is_open: boolean;
    is_collapsed: boolean;
    is_pinned: boolean;
    is_mobile: boolean;
  };
  item_order: string[];
  favorite_items: string[];
  recent_items: string[];
  is_loading: boolean;
  error: string | null;
}

export interface UserNavigationPreferencesDTO {
  user_id: string;
  favorite_items: string[];
  hidden_items: string[];
  custom_order?: string[];
  sidebar_preferences: {
    is_collapsed: boolean;
    is_pinned: boolean;
    width?: number;
  };
  display_preferences: {
    show_icons: boolean;
    show_badges: boolean;
    show_descriptions: boolean;
    compact_mode: boolean;
    group_by_category: boolean;
  };
  last_updated: string;
}

/**
 * Ответы API
 */
export interface NavigationResponse {
  items: NavigationItemDTO[];
  total: number;
  user_preferences?: UserNavigationPreferencesDTO;
}

export interface NavigationItemResponse {
  item: NavigationItemDTO;
}

export interface BreadcrumbsResponse {
  breadcrumbs: BreadcrumbItemDTO[];
}

export interface UserPreferencesResponse {
  preferences: UserNavigationPreferencesDTO;
} 