/**
 * App Sidebar Widget Types
 * Типы для виджета AppSidebar
 */

import type { User } from "@/entities/user";
import type { AppSidebarConfig } from "../ui/AppSidebarView";

// =============================================================================
// Основные типы для AppSidebarWidget
// =============================================================================

export interface AppSidebarProps {
  /** Пользователь для отображения в сайдбаре */
  user?: User;
  /** Сворачивать ли сайдбар по умолчанию */
  defaultCollapsed?: boolean;
  /** Конфигурация виджета */
  config?: Partial<AppSidebarConfig>;
  /** Callback при изменении состояния сворачивания */
  onStateChange?: (isCollapsed: boolean) => void;
  /** Callback при навигации */
  onNavigate?: (path: string, item: any) => void;
  /** Callback при клике на профиль */
  onProfileClick?: (user: User) => void;
  /** Callback при выходе */
  onLogout?: () => void;
  /** CSS класс */
  className?: string;
  /** Кастомные стили */
  sx?: any;
}

// =============================================================================
// Типы состояния сайдбара
// =============================================================================

export interface AppSidebarState {
  /** Свернут ли сайдбар */
  isCollapsed: boolean;
  /** Настройки пользователя */
  userPreferences?: Record<string, any>;
}

export interface AppSidebarActions {
  /** Переключить состояние сворачивания */
  toggleCollapse: () => void;
  /** Установить состояние сворачивания */
  setCollapsed: (collapsed: boolean) => void;
}
