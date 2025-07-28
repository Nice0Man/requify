import React, { useMemo, useCallback, memo } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { AppSidebarView } from "./AppSidebarView";
import { useAppSidebar } from "../model/useAppSidebar";
import { useSidebarNavigation } from "@/features/navigation";
import { useSidebarDnd } from "@/features/sidebar-dnd";
import { useSidebarGroups } from "@/features/sidebar-management";
import { useLogout } from "@/features/auth/hooks/useAuthQuery";
import {
  getDefaultSidebarItems,
  filterItemsByPermissions,
  type SidebarItem,
  type SidebarItemState,
} from "@/entities/sidebar";
import { usePermissions } from "@/features/permissions";
import type { AppSidebarProps } from "../model/types";

// =============================================================================
// Типы для AppSidebarWidget
// =============================================================================

/**
 * Оптимизированный AppSidebarWidget с React.memo
 * Предотвращает ненужные ре-рендеры согласно React best practices
 * Интегрирован с новой системой разрешений
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

    // Получаем разрешения пользователя
    const { permissions } = usePermissions();

    // Хук для управления общим состоянием сайдбара (collapse, preferences)
    const { state: sidebarState, actions: sidebarActions } = useAppSidebar(
      user,
      isMobile ? true : defaultCollapsed
    );

    // Получение элементов сайдбара с использованием новой системы разрешений
    const initialItems = useMemo(() => {
      // ВАЖНО: Если пользователь не загружен или нет разрешений, не показываем элементы
      if (!user?.role || !permissions) {
        return [];
      }

      const allItems = getDefaultSidebarItems(user.role);
      
      // Используем новую систему разрешений для фильтрации
      const filteredItems = filterItemsByPermissions(allItems, permissions);
      
      return filteredItems;
    }, [user?.role, permissions]);

    // Feature hooks для декомпозированной логики
    const navigation = useSidebarNavigation(initialItems, onNavigate);

    const dnd = useSidebarDnd(initialItems, (newItems: SidebarItem[]) => {
      // Можно добавить сохранение порядка элементов в preferences
      console.log("Items reordered:", newItems);
    });



    const groups = useSidebarGroups(
      user,
      (groupId: string, isExpanded: boolean) => {
        // Можно добавить сохранение состояния групп в preferences
        console.log("Group toggled:", groupId, isExpanded);
      }
    );

    // API для logout
    const logoutMutation = useLogout();

    // Обработчик выхода из системы
    const handleLogout = useCallback(async () => {
      try {
        await logoutMutation.mutateAsync();
        onLogout?.();
      } catch (error) {
        console.error("Logout failed:", error);
        // Можно добавить toast notification об ошибке
      }
    }, [logoutMutation, onLogout]);

    // Функция для получения состояния элемента
    const getItemState = useCallback((itemId: string): SidebarItemState => {
      return {
        isActive: false,
        isHovered: false,
        isVisible: true,
      };
    }, []);

    // Обработчик навигации
    const handleNavigation = useCallback(
      (path: string) => {
        navigation.actions.handleItemClick({ id: "", path } as any);
      },
      [navigation.actions]
    );

    return (
      <AppSidebarView
        user={user}
        config={config}
        className={className}
        sx={sx}
        isCollapsed={sidebarState.isCollapsed}
        onToggleCollapse={sidebarActions.toggleCollapse}
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
