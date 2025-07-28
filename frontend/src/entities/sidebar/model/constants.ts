import type { SidebarItem } from "./types";
import type { UserRole } from "@/entities/user";
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  BugReport as BugReportIcon,
  BarChart as BarChartIcon,
  Groups as GroupsIcon,
  Extension as ExtensionIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarTodayIcon,
  AccountTree as AccountTreeIcon,
} from "@mui/icons-material";

// Маппинг иконок
export const SIDEBAR_ICON_MAP = {
  Dashboard: DashboardIcon,
  Assignment: AssignmentIcon,
  Assessment: AssessmentIcon,
  Person: PersonIcon,
  Settings: SettingsIcon,
  Group: GroupIcon,
  AdminPanelSettings: AdminPanelSettingsIcon,
  BugReport: BugReportIcon,
  BarChart: BarChartIcon,
  Groups: GroupsIcon,
  Extension: ExtensionIcon,
  Analytics: AnalyticsIcon,
  Notifications: NotificationsIcon,
  CalendarToday: CalendarTodayIcon,
  AccountTree: AccountTreeIcon,
} as const;

// Конфигурация по умолчанию
export const DEFAULT_SIDEBAR_CONFIG = {
  expandedWidth: 280,
  collapsedWidth: 64,
  animationDuration: 300,
  longClickDelay: 800,
  longClickTolerance: 5,
  showTooltips: true,
  enableKeyboardNavigation: true,
  enableDragAndDrop: false,
} as const;

// Получение стандартных элементов сайдбара
export const getDefaultSidebarItems = (userRole?: UserRole): SidebarItem[] => {
  const baseItems: SidebarItem[] = [
    // Основная навигация (новый порядок)
    {
      id: "dashboard",
      label: "Дашборд",
      icon: "Dashboard",
      path: "/dashboard",
      isDraggable: true,
      allowedRoles: [
        "admin",
        "project_manager",
        "analyst",
        "developer",
        "tester",
        "viewer",
      ],
      order: 1,
      metadata: {
        category: "main",
        description: "Общий обзор системы",
      },
    },
    {
      id: "reports",
      label: "Отчёты",
      icon: "BarChart",
      path: "/reports",
      isDraggable: true,
      allowedRoles: ["admin", "project_manager", "analyst", "viewer"],
      order: 2,
      metadata: {
        category: "main",
        description: "Аналитика и отчёты",
      },
    },
    {
      id: "analytics",
      label: "Аналитика",
      icon: "Analytics",
      path: "/analytics",
      isDraggable: true,
      allowedRoles: ["admin", "project_manager", "analyst"],
      order: 3,
      metadata: {
        category: "main",
        description: "Системная аналитика",
      },
    },
    {
      id: "notifications",
      label: "Уведомления",
      icon: "Notifications",
      path: "/notifications",
      isDraggable: true,
      allowedRoles: [
        "admin",
        "project_manager",
        "analyst",
        "developer",
        "tester",
        "viewer",
      ],
      order: 4,
      metadata: {
        category: "main",
        description: "Центр уведомлений",
      },
    },
    {
      id: "calendar",
      label: "Календарь",
      icon: "CalendarToday",
      path: "/calendar",
      isDraggable: true,
      allowedRoles: [
        "admin",
        "project_manager",
        "analyst",
        "developer",
        "tester",
      ],
      order: 5,
      metadata: {
        category: "main",
        description: "Планирование и календарь",
      },
    },
    {
      id: "teams",
      label: "Команда",
      icon: "Groups",
      path: "/teams",
      isDraggable: true,
      allowedRoles: ["admin", "project_manager"],
      order: 6,
      metadata: {
        category: "main",
        description: "Управление командами",
      },
    },
    {
      id: "processes",
      label: "Процессы",
      icon: "AccountTree",
      path: "/processes",
      isDraggable: true,
      allowedRoles: ["admin", "project_manager", "analyst"],
      order: 7,
      metadata: {
        category: "main",
        description: "Бизнес-процессы",
      },
    },
    {
      id: "projects",
      label: "Проекты",
      icon: "Assignment",
      path: "/projects",
      isDraggable: true,
      allowedRoles: [
        "admin",
        "project_manager",
        "analyst",
        "developer",
        "tester",
        "viewer",
      ],
      order: 8,
      metadata: {
        category: "main",
        description: "Управление проектами",
      },
    },
    {
      id: "requirements",
      label: "Требования",
      icon: "Assignment",
      path: "/requirements",
      isDraggable: true,
      allowedRoles: [
        "admin",
        "project_manager",
        "analyst",
        "developer",
        "tester",
        "viewer",
      ],
      order: 9,
      metadata: {
        category: "main",
        description: "Управление требованиями",
      },
    },
    {
      id: "releases",
      label: "Релизы",
      icon: "Assessment",
      path: "/releases",
      isDraggable: true,
      allowedRoles: [
        "admin",
        "project_manager",
        "analyst",
        "developer",
        "tester",
        "viewer",
      ],
      order: 10,
      metadata: {
        category: "main",
        description: "Управление релизами",
      },
    },
    {
      id: "testing",
      label: "Тестирование",
      icon: "BugReport",
      path: "/testing",
      isDraggable: true,
      allowedRoles: [
        "admin",
        "project_manager",
        "analyst",
        "developer",
        "tester",
        "viewer",
      ],
      order: 11,
      metadata: {
        category: "main",
        description: "Управление тестированием",
      },
    },
    {
      id: "integrations",
      label: "Интеграции",
      icon: "Extension",
      path: "/integrations",
      isDraggable: true,
      allowedRoles: ["admin", "project_manager"],
      order: 8,
      metadata: {
        category: "main",
        description: "Настройка интеграций",
      },
    },

    // Административные элементы (как отдельные элементы)
    {
      id: "admin-users",
      label: "Пользователи",
      icon: "Group",
      path: "/admin/users",
      isDraggable: true,
      allowedRoles: ["admin"],
      order: 101,
      metadata: {
        category: "admin",
        description: "Управление пользователями",
      },
    },
    {
      id: "admin-system",
      label: "Система",
      icon: "Settings",
      path: "/admin/system",
      isDraggable: true,
      allowedRoles: ["admin"],
      order: 102,
      metadata: {
        category: "admin",
        description: "Настройки системы",
      },
    },
    {
      id: "admin-analytics",
      label: "Аналитика",
      icon: "Analytics",
      path: "/admin/analytics",
      isDraggable: true,
      allowedRoles: ["admin"],
      order: 103,
      metadata: {
        category: "admin",
        description: "Системная аналитика",
      },
    },

    // Специальные элементы для viewer
    {
      id: "viewer-personal",
      label: "Получить полный доступ",
      icon: "Star",
      path: "/viewer-personal",
      isDraggable: false,
      allowedRoles: ["viewer"],
      order: 150,
      metadata: {
        category: "main",
        description: "Персональная страница viewer'а с планами",
      },
    },

    // Профильные элементы
    {
      id: "settings",
      label: "Настройки",
      icon: "Settings",
      path: "/settings",
      isDraggable: false,
      allowedRoles: [
        "admin",
        "project_manager",
        "analyst",
        "developer",
        "tester",
        "viewer",
      ],
      order: 200,
      metadata: {
        category: "profile",
        description: "Персональные настройки",
      },
    },
  ];

  // Фильтруем элементы по ролям пользователя
  if (userRole) {
    return filterItemsByRole(baseItems, userRole);
  }

  return baseItems;
};

// Утилита для фильтрации элементов по ролям
export const filterItemsByRole = (
  items: SidebarItem[],
  userRole: UserRole
): SidebarItem[] => {
  return items
    .filter((item) => {
      // Если allowedRoles не указаны, элемент доступен всем
      // Если указаны, проверяем что текущая роль входит в список
      return !item.allowedRoles || item.allowedRoles.includes(userRole);
    })
    .map((item) => ({
      ...item,
      children: item.children
        ? filterItemsByRole(item.children, userRole)
        : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0);
};

// Для обратной совместимости - экспортируем из helpers
export { groupItemsByCategory } from "./helpers";
