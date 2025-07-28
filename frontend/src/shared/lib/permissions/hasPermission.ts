/**
 * Permission Check Utility - Утилита проверки разрешений
 * Оптимизирована с помощью мемоизации для повышения производительности
 */

import { useMemo } from "react";
import type { PermissionConfig } from "@/entities/permissions";

// =============================================================================
// Базовая функция проверки разрешений
// =============================================================================

/**
 * Проверяет наличие разрешения у пользователя
 * @param permissions - конфигурация разрешений пользователя
 * @param resource - ресурс для проверки
 * @param action - действие для проверки
 * @returns true если разрешение есть, false - если нет
 */
export const hasPermission = (
  permissions: PermissionConfig | null,
  resource: string,
  action: string
): boolean => {
  if (!permissions) {
    return false;
  }

  // Формируем ключ разрешения в формате can{Action}{Resource}
  const permissionKey = `can${action.charAt(0).toUpperCase()}${action.slice(
    1
  )}${resource.charAt(0).toUpperCase()}${resource.slice(
    1
  )}` as keyof PermissionConfig;

  // Проверяем наличие разрешения
  if (permissionKey in permissions) {
    const permission = permissions[permissionKey];
    return typeof permission === "boolean" ? permission : false;
  }

  return false;
};

// =============================================================================
// Мемоизированная версия для оптимизации
// =============================================================================

/**
 * Мемоизированная проверка разрешений
 * Кэширует результаты для повышения производительности
 */
export const useMemoizedPermissionCheck = (
  permissions: PermissionConfig | null,
  resource: string,
  action: string
): boolean => {
  return useMemo(() => {
    return hasPermission(permissions, resource, action);
  }, [permissions, resource, action]);
};

// =============================================================================
// Расширенные функции проверки
// =============================================================================

/**
 * Проверяет множественные разрешения (логическое ИЛИ)
 * @param permissions - конфигурация разрешений
 * @param checks - массив проверок [resource, action]
 * @returns true если хотя бы одно разрешение есть
 */
export const hasAnyPermission = (
  permissions: PermissionConfig | null,
  checks: Array<[string, string]>
): boolean => {
  if (!permissions || checks.length === 0) {
    return false;
  }

  return checks.some(([resource, action]) =>
    hasPermission(permissions, resource, action)
  );
};

/**
 * Проверяет множественные разрешения (логическое И)
 * @param permissions - конфигурация разрешений
 * @param checks - массив проверок [resource, action]
 * @returns true если все разрешения есть
 */
export const hasAllPermissions = (
  permissions: PermissionConfig | null,
  checks: Array<[string, string]>
): boolean => {
  if (!permissions || checks.length === 0) {
    return false;
  }

  return checks.every(([resource, action]) =>
    hasPermission(permissions, resource, action)
  );
};

// =============================================================================
// Специализированные проверки
// =============================================================================

/**
 * Проверяет возможность доступа к странице
 * @param permissions - конфигурация разрешений
 * @param pageName - название страницы
 * @returns true если доступ разрешен
 */
export const canAccessPage = (
  permissions: PermissionConfig | null,
  pageName: string
): boolean => {
  if (!permissions) {
    return false;
  }

  switch (pageName) {
    case "dashboard":
      return permissions.canViewDashboard;

    case "projects":
      return hasAnyPermission(permissions, [
        ["projects", "view"],
        ["projects", "manage"],
        ["projects", "create"],
        ["projects", "edit"],
      ]);

    case "requirements":
      return hasAnyPermission(permissions, [
        ["requirements", "view"],
        ["requirements", "manage"],
        ["requirements", "create"],
        ["requirements", "edit"],
      ]);

    case "releases":
      return hasAnyPermission(permissions, [
        ["releases", "view"],
        ["releases", "manage"],
        ["releases", "create"],
        ["releases", "edit"],
      ]);

    case "testing":
      return permissions.canViewTesting || permissions.canManageTesting;

    case "teams":
      return permissions.canManageTeams || permissions.canViewTeams;

    case "users":
      return permissions.canManageUsers || permissions.canViewUsers;

    case "reports":
      return permissions.canViewReports || permissions.canCreateReports;

    case "admin":
      return permissions.canViewAdmin;

    default:
      return false;
  }
};

/**
 * Проверяет возможность отображения элемента сайдбара
 * @param permissions - конфигурация разрешений
 * @param itemName - название элемента
 * @returns true если элемент можно отображать
 */
export const canShowSidebarItem = (
  permissions: PermissionConfig | null,
  itemName: string
): boolean => {
  if (!permissions) {
    return false;
  }

  return permissions.sidebarItems?.includes(itemName) ?? false;
};
