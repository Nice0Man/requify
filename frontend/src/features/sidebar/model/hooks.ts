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
  Person,
  Archive,
  ReviewsOutlined,
  Schedule,
  History,
  Quiz,
  AssignmentTurnedIn,
  BarChart,
  Notifications,
  CalendarToday,
  Group,
  AccountTree,
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
      "/projects/my": "projects-my",
      "/projects/new": "projects-new",
      "/projects/archived": "projects-archived",
      "/requirements/my": "requirements-my",
      "/requirements/review": "requirements-review",
      "/releases/upcoming": "releases-upcoming",
      "/releases/history": "releases-history",
      "/testing/cases": "testing-cases",
      "/testing/results": "testing-results",
      "/reports": "reports",
      "/analytics": "analytics",
      "/notifications": "notifications",
      "/calendar": "calendar",
      "/team": "team",
      "/workflow": "workflow",
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
    if (location.pathname.startsWith("/requirements")) {
      if (!store.expandedItems.includes("requirements")) {
        store.toggleExpanded("requirements");
      }
    }
    if (location.pathname.startsWith("/releases")) {
      if (!store.expandedItems.includes("releases")) {
        store.toggleExpanded("releases");
      }
    }
    if (location.pathname.startsWith("/testing")) {
      if (!store.expandedItems.includes("testing")) {
        store.toggleExpanded("testing");
      }
    }
  }, [location.pathname]);

  return store;
};

export const useSidebarConfig = (): SidebarConfig => {
  const theme = useTheme();

  return useMemo(
    () => ({
      width: 240,
      collapsedWidth: 60,
      animationDuration: 250,
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
        badge: 8,
        children: [
          {
            id: "projects-all",
            label: t("sidebar.allProjects"),
            icon: FolderOpen,
            path: "/projects",
            color: theme.palette.secondary.main,
          },
          {
            id: "projects-my",
            label: t("sidebar.myProjects"),
            icon: Person,
            path: "/projects/my",
            color: theme.palette.secondary.main,
            badge: 3,
          },
          {
            id: "projects-new",
            label: t("sidebar.createProject"),
            icon: AddCircle,
            path: "/projects/new",
            color: theme.palette.secondary.main,
            isNew: true,
          },
          {
            id: "projects-archived",
            label: t("sidebar.archivedProjects"),
            icon: Archive,
            path: "/projects/archived",
            color: theme.palette.secondary.main,
          },
        ],
      },
      {
        id: "requirements",
        label: t("sidebar.requirements"),
        icon: Assignment,
        color: theme.palette.success.main,
        badge: 15,
        children: [
          {
            id: "requirements-my",
            label: t("sidebar.myRequirements"),
            icon: Person,
            path: "/requirements/my",
            color: theme.palette.success.main,
            badge: 7,
          },
          {
            id: "requirements-review",
            label: t("sidebar.reviewRequirements"),
            icon: ReviewsOutlined,
            path: "/requirements/review",
            color: theme.palette.success.main,
            badge: 8,
          },
        ],
      },
      {
        id: "releases",
        label: t("sidebar.releases"),
        icon: RocketLaunch,
        color: theme.palette.info.main,
        children: [
          {
            id: "releases-upcoming",
            label: t("sidebar.upcomingReleases"),
            icon: Schedule,
            path: "/releases/upcoming",
            color: theme.palette.info.main,
            badge: 2,
          },
          {
            id: "releases-history",
            label: t("sidebar.pastReleases"),
            icon: History,
            path: "/releases/history",
            color: theme.palette.info.main,
          },
        ],
      },
      {
        id: "testing",
        label: t("sidebar.testing"),
        icon: BugReport,
        color: theme.palette.warning.main,
        badge: 5,
        children: [
          {
            id: "testing-cases",
            label: t("sidebar.testCases"),
            icon: Quiz,
            path: "/testing/cases",
            color: theme.palette.warning.main,
            badge: 3,
          },
          {
            id: "testing-results",
            label: t("sidebar.testResults"),
            icon: AssignmentTurnedIn,
            path: "/testing/results",
            color: theme.palette.warning.main,
            badge: 2,
          },
        ],
      },
      {
        id: "reports",
        label: t("sidebar.reports"),
        icon: Analytics,
        path: "/reports",
        color: theme.palette.error.main,
      },
      {
        id: "analytics",
        label: t("sidebar.analytics"),
        icon: BarChart,
        path: "/analytics",
        color: theme.palette.info.main,
        isNew: true,
      },
      {
        id: "notifications",
        label: t("sidebar.notifications"),
        icon: Notifications,
        path: "/notifications",
        color: theme.palette.warning.main,
        badge: 12,
      },
      {
        id: "calendar",
        label: t("sidebar.calendar"),
        icon: CalendarToday,
        path: "/calendar",
        color: theme.palette.primary.main,
      },
      {
        id: "team",
        label: t("sidebar.team"),
        icon: Group,
        path: "/team",
        color: theme.palette.secondary.main,
      },
      {
        id: "workflow",
        label: t("sidebar.workflow"),
        icon: AccountTree,
        path: "/workflow",
        color: theme.palette.success.main,
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
