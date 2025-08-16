import { useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { SidebarItem } from "@/entities/sidebar";
import type { User } from "@/entities/user";

export interface NavigationState {
  activeItemId: string | undefined;
  currentPath: string;
}

export interface NavigationActions {
  handleItemClick: (item: SidebarItem) => void;
  handleProfileClick: (
    user?: User,
    onProfileClick?: (user: User) => void
  ) => void;
  handleSettingsClick: () => void;
  getItemState: (
    item: SidebarItem,
    activeItemId?: string
  ) => {
    isActive: boolean;
    isHovered: boolean;
    isVisible: boolean;
  };
}

export interface UseSidebarNavigationReturn {
  state: NavigationState;
  actions: NavigationActions;
}

/**
 * Хук для управления навигацией в сайдбаре
 * Выделен из AppSidebarWidget согласно FSD принципам [[cite](https://medium.com/dailyjs/techniques-for-decomposing-react-components-e8a1081ef5da)]
 */
export const useSidebarNavigation = (
  sidebarItems: SidebarItem[],
  onNavigate?: (path: string, item: SidebarItem) => void
): UseSidebarNavigationReturn => {
  const navigate = useNavigate();
  const location = useLocation();

  // Определение активного элемента на основе текущего роута
  const activeItemId = useMemo(() => {
    const currentPath = location.pathname;

    const findActiveItem = (items: SidebarItem[]): string | undefined => {
      for (const item of items) {
        if (item.path && currentPath.startsWith(item.path)) {
          return item.id;
        }
        if (item.children) {
          const activeChild = findActiveItem(item.children);
          if (activeChild) return activeChild;
        }
      }
      return undefined;
    };

    return findActiveItem(sidebarItems);
  }, [location.pathname, sidebarItems]);

  // Обработка клика по элементу навигации
  const handleItemClick = useCallback(
    (item: SidebarItem) => {
      if (item.onClick) {
        item.onClick();
      } else if (item.path) {
        navigate(item.path);
        onNavigate?.(item.path, item);
      }
    },
    [navigate, onNavigate]
  );

  // Обработка клика по профилю - редирект на profile/settings страницу
  const handleProfileClick = useCallback(
    (user?: User, onProfileClick?: (user: User) => void) => {
      if (user && onProfileClick) {
        onProfileClick(user);
      } else if (user) {
        // По умолчанию переходим в настройки (профиль)
        navigate("/settings");
      }
    },
    [navigate]
  );

  // Обработка клика по настройкам - редирект на profile settings
  const handleSettingsClick = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  // Получение состояния элемента для презентации
  const getItemState = useCallback(
    (item: SidebarItem, currentActiveId?: string) => {
      const itemActiveId = currentActiveId ?? activeItemId;
      return {
        isActive: itemActiveId === item.id,
        isHovered: false,
        isVisible: true,
      };
    },
    [activeItemId]
  );

  return {
    state: {
      activeItemId,
      currentPath: location.pathname,
    },
    actions: {
      handleItemClick,
      handleProfileClick,
      handleSettingsClick,
      getItemState,
    },
  };
};
