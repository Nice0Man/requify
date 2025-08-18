/**
 * Shared Sidebar Types
 * Типы сайдбара вынесены в shared для переиспользования
 */

/**
 * Роль пользователя для определения доступных элементов
 */
export type UserRole = 
  | "admin" 
  | "user" 
  | "guest" 
  | "manager" 
  | "developer"
  | "project_manager"
  | "analyst"
  | "tester"
  | "viewer";

/**
 * Тип элемента сайдбара
 */
export type SidebarItemType = "link" | "action" | "group" | "divider";

/**
 * Элемент сайдбара
 */
export interface SidebarItem {
  /** Уникальный идентификатор */
  id: string;
  /** Тип элемента */
  type: SidebarItemType;
  /** Название элемента */
  label: string;
  /** Иконка элемента (название иконки Material UI) */
  icon?: string;
  /** Ссылка (для type: 'link') */
  href?: string;
  /** Обработчик клика (для type: 'action') */
  onClick?: () => void;
  /** Бейдж с числом уведомлений */
  badge?: number;
  /** Активен ли элемент */
  isActive?: boolean;
  /** Видим ли элемент */
  visible?: boolean;
  /** Отключен ли элемент */
  disabled?: boolean;
  /** Дочерние элементы (для type: 'group') */
  children?: SidebarItem[];
  /** Свернута ли группа */
  collapsed?: boolean;
  /** Описание для tooltip */
  description?: string;
  /** Роли, которым доступен элемент */
  allowedRoles?: UserRole[];
  /** Приоритет сортировки */
  priority?: number;
  /** Можно ли перетаскивать */
  draggable?: boolean;
}

/**
 * Элемент нижней навигации
 */
export interface BottomNavItem {
  /** Уникальный идентификатор */
  id: string;
  /** Название элемента */
  label: string;
  /** Иконка элемента (название иконки Material UI) */
  icon: string;
  /** Ссылка */
  href?: string;
  /** Обработчик клика */
  onClick?: () => void;
  /** Только для админов */
  adminOnly?: boolean;
  /** Описание для tooltip */
  description?: string;
  /** Отключен ли элемент */
  disabled?: boolean;
  /** Внешняя ссылка */
  external?: boolean;
} 