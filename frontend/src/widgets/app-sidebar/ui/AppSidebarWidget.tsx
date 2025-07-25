import React, { useMemo, memo } from "react";
import { useMediaQuery, useTheme } from "@mui/material";

// Импорты из entities
import type { User } from "@/entities/user";
import { getDefaultSidebarItems, filterItemsByRole } from "@/entities/sidebar";

// Импорты из features
import { useLogout } from "@/features/auth/hooks/useAuthQuery";
import { useSidebarNavigation } from "@/features/navigation";
import { useSidebarDnd } from "@/features/sidebar-dnd";
import { useSidebarGroups } from "@/features/sidebar-management";

// Хук сайдбара (остается в widgets как композиция)
import { useAppSidebar } from "../model/useAppSidebar";

// Презентационный компонент
import { AppSidebarView, type AppSidebarConfig } from "./AppSidebarView";

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

/**
 * Оптимизированный AppSidebarWidget с React.memo
 * Предотвращает ненужные ре-рендеры согласно React best practices
 */
export const AppSidebarWidget: React.FC<AppSidebarProps> = memo(
  ({
    user,
    defaultCollapsed = false,
    config = {},
    onStateChange,
    onNavigate,
    onProfileClick,
    onLogout,
    className,
    sx,
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Хук для управления общим состоянием сайдбара (collapse, preferences)
    const { state: sidebarState, actions: sidebarActions } = useAppSidebar(
      user,
      isMobile ? true : defaultCollapsed
    );

    // Получение элементов сайдбара
    const initialItems = useMemo(() => {
      const items = getDefaultSidebarItems(user?.role);
      return user?.role ? filterItemsByRole(items, user.role) : items;
    }, [user?.role]);

    // Feature hooks для декомпозированной логики
    const navigation = useSidebarNavigation(initialItems, onNavigate);

    const dnd = useSidebarDnd(initialItems, (newItems) => {
      // Можно добавить сохранение порядка элементов в preferences
      console.log("Items reordered:", newItems);
    });

    const groups = useSidebarGroups(user, (groupId, isExpanded) => {
      // Можно добавить сохранение состояния групп в preferences
      console.log("Group toggled:", groupId, isExpanded);
    });

    // API для logout
    const logoutMutation = useLogout();

    // Обработчик выхода из системы
    const handleLogout = useMemo(
      () => async () => {
        if (onLogout) {
          onLogout();
        } else {
          try {
            await logoutMutation.mutateAsync();
            // После успешного logout API автоматически очистит токены и кэш
            // Navigation происходит в navigation feature
          } catch (error) {
            console.error("Logout failed:", error);
          }
        }
      },
      [onLogout, logoutMutation]
    );

    // Обработчик переключения состояния сворачивания
    const handleToggleCollapse = useMemo(
      () => () => {
        sidebarActions.toggleCollapse();
        onStateChange?.(!sidebarState.isCollapsed);
      },
      [sidebarActions, onStateChange, sidebarState.isCollapsed]
    );

    return (
      <AppSidebarView
        user={user}
        config={config}
        className={className}
        sx={sx}
        isCollapsed={sidebarState.isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        navigationState={navigation.state}
        navigationActions={navigation.actions}
        dndState={dnd.state}
        dndActions={dnd.actions}
        groupsState={groups.state}
        groupsActions={groups.actions}
        onLogout={handleLogout}
        onProfileClick={onProfileClick}
        onStateChange={onStateChange}
      />
    );
  }
);

AppSidebarWidget.displayName = "AppSidebarWidget";
