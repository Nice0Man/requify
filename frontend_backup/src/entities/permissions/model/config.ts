/**
 * Permissions Role Configuration - Конфигурация разрешений по ролям
 * Определяет какие разрешения имеет каждая роль пользователя
 */

import type { UserRole } from "@/entities/user/model/types";
import type { PermissionConfig } from "./types";

// =============================================================================
// Конфигурация разрешений по ролям
// =============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, PermissionConfig> = {
  admin: {
    // Dashboard
    canViewDashboard: true,

    // Projects - полный доступ
    canManageProjects: true,
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canViewProjects: true,

    // Requirements - полный доступ
    canManageRequirements: true,
    canCreateRequirements: true,
    canEditRequirements: true,
    canDeleteRequirements: true,
    canViewRequirements: true,

    // Releases - полный доступ
    canManageReleases: true,
    canCreateReleases: true,
    canEditReleases: true,
    canDeleteReleases: true,
    canViewReleases: true,

    // Users & Teams - полный доступ
    canManageUsers: true,
    canManageTeams: true,
    canViewUsers: true,
    canViewTeams: true,

    // Testing - полный доступ
    canViewTesting: true,
    canManageTesting: true,
    canCreateTests: true,
    canExecuteTests: true,

    // Reports - полный доступ
    canViewReports: true,
    canCreateReports: true,
    canExportReports: true,

    // Administration - полный доступ
    canViewAdmin: true,
    canManageSystem: true,
    canManagePermissions: true,

    // Navigation  
    sidebarItems: [
      "dashboard",
      "reports", 
      "analytics",
      "notifications",
      "calendar",
      "teams",
      "processes",
      "projects",
      "requirements",
      "releases",
      "testing",
      "users",
      "admin-users",
      "admin-system", 
      "admin-analytics",
    ],
  },

  project_manager: {
    // Dashboard
    canViewDashboard: true,

    // Projects - управление без удаления
    canManageProjects: true,
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canViewProjects: true,

    // Requirements - управление без удаления
    canManageRequirements: true,
    canCreateRequirements: true,
    canEditRequirements: true,
    canDeleteRequirements: false,
    canViewRequirements: true,

    // Releases - полное управление
    canManageReleases: true,
    canCreateReleases: true,
    canEditReleases: true,
    canDeleteReleases: true,
    canViewReleases: true,

    // Users & Teams - только команды
    canManageUsers: false,
    canManageTeams: true,
    canViewUsers: true,
    canViewTeams: true,

    // Testing - просмотр и управление
    canViewTesting: true,
    canManageTesting: true,
    canCreateTests: true,
    canExecuteTests: true,

    // Reports - просмотр и создание
    canViewReports: true,
    canCreateReports: true,
    canExportReports: true,

    // Administration - нет доступа
    canViewAdmin: false,
    canManageSystem: false,
    canManagePermissions: false,

    // Navigation
    sidebarItems: [
      "dashboard",
      "reports",
      "analytics",
      "notifications", 
      "calendar",
      "teams",
      "processes",
      "projects",
      "requirements",
      "releases",
      "testing",
    ],
  },

  analyst: {
    // Dashboard
    canViewDashboard: true,

    // Projects - только просмотр
    canManageProjects: false,
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewProjects: true,

    // Requirements - создание и редактирование
    canManageRequirements: true,
    canCreateRequirements: true,
    canEditRequirements: true,
    canDeleteRequirements: false,
    canViewRequirements: true,

    // Releases - только просмотр
    canManageReleases: false,
    canCreateReleases: false,
    canEditReleases: false,
    canDeleteReleases: false,
    canViewReleases: true,

    // Users & Teams - только просмотр
    canManageUsers: false,
    canManageTeams: false,
    canViewUsers: true,
    canViewTeams: true,

    // Testing - просмотр без управления
    canViewTesting: true,
    canManageTesting: false,
    canCreateTests: false,
    canExecuteTests: false,

    // Reports - просмотр и создание
    canViewReports: true,
    canCreateReports: true,
    canExportReports: false,

    // Administration - нет доступа
    canViewAdmin: false,
    canManageSystem: false,
    canManagePermissions: false,

    // Navigation
    sidebarItems: [
      "dashboard",
      "reports",
      "analytics",
      "notifications",
      "calendar", 
      "projects",
      "requirements",
      "testing",
    ],
  },

  developer: {
    // Dashboard
    canViewDashboard: true,

    // Projects - только просмотр
    canManageProjects: false,
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewProjects: true,

    // Requirements - только редактирование (обновление статуса)
    canManageRequirements: false,
    canCreateRequirements: false,
    canEditRequirements: true,
    canDeleteRequirements: false,
    canViewRequirements: true,

    // Releases - только просмотр
    canManageReleases: false,
    canCreateReleases: false,
    canEditReleases: false,
    canDeleteReleases: false,
    canViewReleases: true,

    // Users & Teams - только просмотр
    canManageUsers: false,
    canManageTeams: false,
    canViewUsers: false,
    canViewTeams: true,

    // Testing - просмотр и выполнение
    canViewTesting: true,
    canManageTesting: false,
    canCreateTests: false,
    canExecuteTests: true,

    // Reports - только просмотр
    canViewReports: false,
    canCreateReports: false,
    canExportReports: false,

    // Administration - нет доступа
    canViewAdmin: false,
    canManageSystem: false,
    canManagePermissions: false,

    // Navigation
    sidebarItems: [
      "dashboard",
      "notifications",
      "calendar",
      "projects",
      "requirements",
      "testing",
    ],
  },

  tester: {
    // Dashboard
    canViewDashboard: true,

    // Projects - только просмотр
    canManageProjects: false,
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewProjects: true,

    // Requirements - только просмотр
    canManageRequirements: false,
    canCreateRequirements: false,
    canEditRequirements: false,
    canDeleteRequirements: false,
    canViewRequirements: true,

    // Releases - только просмотр
    canManageReleases: false,
    canCreateReleases: false,
    canEditReleases: false,
    canDeleteReleases: false,
    canViewReleases: true,

    // Users & Teams - только просмотр
    canManageUsers: false,
    canManageTeams: false,
    canViewUsers: false,
    canViewTeams: true,

    // Testing - полное управление
    canViewTesting: true,
    canManageTesting: true,
    canCreateTests: true,
    canExecuteTests: true,

    // Reports - просмотр и создание отчетов по тестированию
    canViewReports: true,
    canCreateReports: true,
    canExportReports: false,

    // Administration - нет доступа
    canViewAdmin: false,
    canManageSystem: false,
    canManagePermissions: false,

    // Navigation
    sidebarItems: [
      "dashboard",
      "notifications",
      "calendar",
      "projects",
      "requirements",
      "testing",
      "reports",
    ],
  },

  viewer: {
    // Dashboard
    canViewDashboard: true,

    // Projects - только просмотр
    canManageProjects: false,
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewProjects: true,

    // Requirements - только просмотр
    canManageRequirements: false,
    canCreateRequirements: false,
    canEditRequirements: false,
    canDeleteRequirements: false,
    canViewRequirements: true,

    // Releases - только просмотр
    canManageReleases: false,
    canCreateReleases: false,
    canEditReleases: false,
    canDeleteReleases: false,
    canViewReleases: true,

    // Users & Teams - нет доступа
    canManageUsers: false,
    canManageTeams: false,
    canViewUsers: false,
    canViewTeams: false,

    // Testing - нет доступа
    canViewTesting: false,
    canManageTesting: false,
    canCreateTests: false,
    canExecuteTests: false,

    // Reports - нет доступа
    canViewReports: false,
    canCreateReports: false,
    canExportReports: false,

    // Administration - нет доступа
    canViewAdmin: false,
    canManageSystem: false,
    canManagePermissions: false,

    // Navigation
    sidebarItems: [
      "dashboard",
      "notifications",
      "projects", 
      "requirements",
    ],
  },
};

// =============================================================================
// Утилиты для работы с конфигурацией
// =============================================================================

/**
 * Получает конфигурацию разрешений для роли
 */
export const getPermissionsForRole = (
  role: UserRole | null
): PermissionConfig => {
  if (!role || !(role in ROLE_PERMISSIONS)) {
    return ROLE_PERMISSIONS.viewer;
  }

  return ROLE_PERMISSIONS[role];
};

/**
 * Проверяет, есть ли у роли конкретное разрешение
 */
export const roleHasPermission = (
  role: UserRole | null,
  permissionKey: keyof PermissionConfig
): boolean => {
  const permissions = getPermissionsForRole(role);
  const permission = permissions[permissionKey];

  return typeof permission === "boolean" ? permission : false;
};

/**
 * Проверяет, может ли роль отображать элемент сайдбара
 */
export const roleCanShowSidebarItem = (
  role: UserRole | null,
  itemName: string
): boolean => {
  const permissions = getPermissionsForRole(role);
  return permissions.sidebarItems.includes(itemName);
};
