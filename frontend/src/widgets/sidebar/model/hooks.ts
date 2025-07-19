import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTheme, useMediaQuery } from "@mui/material";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSidebarStore } from "./store";
import { sidebarConfig } from "./config";
import { SidebarItem } from "./types";
import {
  Dashboard,
  Analytics,
  BarChart,
  CalendarToday,
  Group,
  AccountTree,
  FolderOpen,
  Assignment,
  RocketLaunch,
  Settings,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const useSidebar = () => {
  const store = useSidebarStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const location = useLocation();

  // Обновляем состояние мобильного режима
  useEffect(() => {
    store.setMobile(isMobile);
  }, [isMobile]);

  // Загружаем сохраненный порядок при инициализации
  useEffect(() => {
    if (sidebarConfig.persistOrder) {
      store.loadOrder();
    }
  }, []); // Выполняется только один раз при монтировании

  // Обновляем активный элемент на основе текущего пути
  useEffect(() => {
    const currentPath = location.pathname;
    const pathSegments = currentPath.split("/").filter(Boolean);

    if (pathSegments.length > 0) {
      const activeItemId = pathSegments[0] as UniqueIdentifier;
      store.setActiveItem(activeItemId);
    }
  }, [location.pathname]);

  return {
    ...store,
    isMobile,
    config: sidebarConfig,
  };
};

export const useSidebarItems = (): SidebarItem[] => {
  const theme = useTheme();
  const { itemOrder } = useSidebarStore();
  const { t } = useTranslation();

  const allItems: Record<string, SidebarItem> = useMemo(
    () => ({
      dashboard: {
        id: "dashboard",
        label: t("sidebar.dashboard"),
        icon: Dashboard,
        path: "/dashboard",
        color: theme.palette.primary.main,
        order: 1,
        isDraggable: true,
        data: {
          type: "sidebar-item",
        },
      },
      reports: {
        id: "reports",
        label: t("sidebar.reports"),
        icon: Analytics,
        path: "/reports",
        color: theme.palette.error.main,
        order: 2,
        isDraggable: true,
        data: {
          type: "sidebar-item",
        },
      },
      analytics: {
        id: "analytics",
        label: t("sidebar.analytics"),
        icon: BarChart,
        path: "/analytics",
        color: theme.palette.info.main,
        order: 3,
        isDraggable: true,
        data: {
          type: "sidebar-item",
        },
      },
      // notifications: {
      //   id: "notifications",
      //   label: t("sidebar.notifications"),
      //   icon: Notifications,
      //   path: "/notifications",
      //   color: theme.palette.warning.main,
      //   order: 4,
      //   isDraggable: true,
      //   badge: 12,
      //   data: {
      //     type: "sidebar-item",
      //   },
      // },
      calendar: {
        id: "calendar",
        label: t("sidebar.calendar"),
        icon: CalendarToday,
        path: "/calendar",
        color: theme.palette.primary.main,
        order: 5,
        isDraggable: true,
        data: {
          type: "sidebar-item",
        },
      },
      team: {
        id: "team",
        label: t("sidebar.team"),
        icon: Group,
        path: "/team",
        color: theme.palette.secondary.main,
        order: 6,
        isDraggable: true,
        data: {
          type: "sidebar-item",
        },
      },
      processes: {
        id: "processes",
        label: t("sidebar.workflow"),
        icon: AccountTree,
        path: "/processes",
        color: theme.palette.success.main,
        order: 7,
        isDraggable: true,
        data: {
          type: "sidebar-item",
        },
      },
      projects: {
        id: "projects",
        label: t("sidebar.projects"),
        icon: FolderOpen,
        path: "/projects",
        color: theme.palette.secondary.main,
        order: 8,
        isDraggable: true,
        badge: 8,
        data: {
          type: "sidebar-item",
        },
      },
      requirements: {
        id: "requirements",
        label: t("sidebar.requirements"),
        icon: Assignment,
        path: "/requirements",
        color: theme.palette.success.main,
        order: 9,
        isDraggable: true,
        badge: 15,
        data: {
          type: "sidebar-item",
        },
      },
      releases: {
        id: "releases",
        label: t("sidebar.releases"),
        icon: RocketLaunch,
        path: "/releases",
        color: theme.palette.info.main,
        order: 10,
        isDraggable: true,
        data: {
          type: "sidebar-item",
        },
      },
    }),
    [theme, t]
  );

  // Возвращаем элементы в пользовательском порядке
  return useMemo(() => {
    return itemOrder
      .map((itemId) => allItems[itemId as string])
      .filter(Boolean);
  }, [itemOrder, allItems]);
};

export const useSidebarBottomItems = (): SidebarItem[] => {
  const theme = useTheme();
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        id: "admin",
        label: t("sidebar.admin"),
        icon: AdminPanelSettings,
        path: "/admin",
        color: theme.palette.warning.main,
        order: 1,
        isDraggable: false,
        data: {
          type: "sidebar-item",
        },
      },
      {
        id: "settings",
        label: t("sidebar.settings"),
        icon: Settings,
        path: "/settings",
        color: theme.palette.grey[600],
        order: 2,
        isDraggable: false,
        data: {
          type: "sidebar-item",
        },
      },
    ],
    [theme, t]
  );
};

export const useSidebarConfig = () => {
  return sidebarConfig;
};

// Упрощенный хук для компонентов, которым нужны только базовые данные
export const useSidebarState = () => {
  const { isCollapsed, isMobile, isOpen, setOpen } = useSidebarStore();
  return { isCollapsed, isMobile, isOpen, setOpen };
};

// Новый упрощенный хук для DND операций
export const useSidebarDnd = () => {
  const { 
    reorderItems, 
    setDragging, 
    saveOrder, 
    resetToDefaultOrder,
    setActiveId,
    setOverId,
    activeId,
    overId,
    isDragging
  } = useSidebarStore();

  const handleDragStart = (id: UniqueIdentifier) => {
    setActiveId(id);
    setDragging(true, id);
  };

  const handleDragOver = (overId: UniqueIdentifier | null) => {
    setOverId(overId);
  };

  const handleDragEnd = (activeId: UniqueIdentifier, overId: UniqueIdentifier | null) => {
    if (overId && activeId !== overId) {
      reorderItems(activeId, overId);
      if (sidebarConfig.persistOrder) {
        saveOrder();
      }
    }
    
    setActiveId(null);
    setOverId(null);
    setDragging(false);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
    setDragging(false);
  };

  const handleResetOrder = () => {
    resetToDefaultOrder();
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleResetOrder,
    activeId,
    overId,
    isDragging,
  };
};
