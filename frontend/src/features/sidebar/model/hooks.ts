import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTheme, useMediaQuery } from "@mui/material";
import { useSidebarStore } from "./store";
import { SidebarItem, SidebarConfig } from "./types";
import {
  Dashboard,
  FolderOpen,
  Assignment,
  RocketLaunch,
  BugReport,
  Analytics,
  Settings,
  AdminPanelSettings,
  AddCircle,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const useSidebar = () => {
  const store = useSidebarStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const location = useLocation();
  const { t } = useTranslation();
  // Обновляем состояние мобильного режима
  useEffect(() => {
    store.setMobile(isMobile);
  }, [isMobile]);

  // Автоматически устанавливаем активный элемент на основе пути
  useEffect(() => {
    const pathMap: Record<string, string> = {
      "/dashboard": "dashboard",
      "/projects": "projects-all",
      "/projects/new": "projects-new",
      "/requirements": "requirements",
      "/releases": "releases",
      "/testing": "testing",
      "/reports": "reports",
      "/admin": "admin",
      "/settings": "settings",
    };

    const activeItem = pathMap[location.pathname] || null;
    store.setActiveItem(activeItem);

    // Разворачиваем родительские элементы для активного пути
    if (location.pathname.startsWith("/projects")) {
      if (!store.expandedItems.includes("projects")) {
        store.toggleExpanded("projects");
      }
    }
  }, [location.pathname]);

  return store;
};

export const useSidebarConfig = (): SidebarConfig => {
  const theme = useTheme();

  return useMemo(
    () => ({
      width: 280,
      collapsedWidth: 72,
      animationDuration: 300,
      showLabels: true,
      showBadges: true,
      enableTooltips: true,
    }),
    []
  );
};

export const useSidebarItems = (): SidebarItem[] => {
  const theme = useTheme();
  const { t } = useTranslation();
  return useMemo(
    () => [
      {
        id: "dashboard",
        label: t("sidebar.dashboard"),
        icon: Dashboard,
        path: "/dashboard",
        color: theme.palette.primary.main,
      },
      {
        id: "projects",
        label: t("sidebar.projects"),
        icon: FolderOpen,
        color: theme.palette.secondary.main,
        badge: 3,
        children: [
          {
            id: "projects-all",
            label: t("sidebar.allProjects"),
            icon: FolderOpen,
            path: "/projects",
            color: theme.palette.secondary.main,
          },
          {
            id: "projects-new",
            label: t("sidebar.createProject"),
            icon: AddCircle,
            path: "/projects/new",
            color: theme.palette.secondary.main,
          },
        ],
      },
      {
        id: "requirements",
        label: t("sidebar.requirements"),
        icon: Assignment,
        path: "/requirements",
        color: theme.palette.success.main,
        badge: 12,
      },
      {
        id: "releases",
        label: t("sidebar.releases"),
        icon: RocketLaunch,
        path: "/releases",
        color: theme.palette.info.main,
      },
      {
        id: "testing",
        label: t("sidebar.testing"),
        icon: BugReport,
        path: "/testing",
        color: theme.palette.warning.main,
        badge: 2,
      },
      {
        id: "reports",
        label: t("sidebar.reports"),
        icon: Analytics,
        path: "/reports",
        color: theme.palette.error.main,
      },
    ],
    [theme, t]
  );
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
      },
      {
        id: "settings",
        label: t("sidebar.settings"),
        icon: Settings,
        path: "/settings",
        color: theme.palette.grey[600],
      },
    ],
    [theme, t]
  );
};
