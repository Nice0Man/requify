import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTheme, useMediaQuery } from "@mui/material";
import { useSidebarStore } from "./store";
import { sidebarConfig } from "./config";
import { SidebarItem } from "./types";
import {
  Dashboard,
  Analytics,
  BarChart,
  Notifications,
  CalendarToday,
  Group,
  AccountTree,
  FolderOpen,
  Assignment,
  RocketLaunch,
  Settings,
  AdminPanelSettings,
  AddCircle,
  Person,
  Archive,
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
      const activeItemId = pathSegments[0];
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
      },
      reports: {
        id: "reports",
        label: t("sidebar.reports"),
        icon: Analytics,
        path: "/reports",
        color: theme.palette.error.main,
        order: 2,
        isDraggable: true,
      },
      analytics: {
        id: "analytics",
        label: t("sidebar.analytics"),
        icon: BarChart,
        path: "/analytics",
        color: theme.palette.info.main,
        order: 3,
        isDraggable: true,
      },
      notifications: {
        id: "notifications",
        label: t("sidebar.notifications"),
        icon: Notifications,
        path: "/notifications",
        color: theme.palette.warning.main,
        order: 4,
        isDraggable: true,
        badge: 12,
      },
      calendar: {
        id: "calendar",
        label: t("sidebar.calendar"),
        icon: CalendarToday,
        path: "/calendar",
        color: theme.palette.primary.main,
        order: 5,
        isDraggable: true,
      },
      team: {
        id: "team",
        label: t("sidebar.team"),
        icon: Group,
        path: "/team",
        color: theme.palette.secondary.main,
        order: 6,
        isDraggable: true,
      },
      processes: {
        id: "processes",
        label: t("sidebar.workflow"),
        icon: AccountTree,
        path: "/processes",
        color: theme.palette.success.main,
        order: 7,
        isDraggable: true,
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
      },
      releases: {
        id: "releases",
        label: t("sidebar.releases"),
        icon: RocketLaunch,
        path: "/releases",
        color: theme.palette.info.main,
        order: 10,
        isDraggable: true,
      },
    }),
    [theme]
  );

  // Возвращаем элементы в пользовательском порядке
  return useMemo(() => {
    return itemOrder.map((itemId) => allItems[itemId]).filter(Boolean);
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
      },
      {
        id: "settings",
        label: t("sidebar.settings"),
        icon: Settings,
        path: "/settings",
        color: theme.palette.grey[600],
        order: 2,
        isDraggable: false,
      },
    ],
    [theme]
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

export const useSidebarDragAndDrop = () => {
  const { reorderItems, setDragging, saveOrder, resetToDefaultOrder } =
    useSidebarStore();

  const handleDragStart = (itemId: string) => {
    setDragging(true, itemId);
  };

  const handleDragEnd = () => {
    setDragging(false);
    if (sidebarConfig.persistOrder) {
      saveOrder();
    }
  };

  const handleDrop = (dragIndex: number, hoverIndex: number) => {
    reorderItems(dragIndex, hoverIndex);
  };

  const handleResetOrder = () => {
    resetToDefaultOrder();
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleResetOrder,
  };
};
