/**
 * Sidebar Helpers with Permissions Integration
 * Интеграция сайдбара с новой системой разрешений
 */

import type { SidebarItem, UserRole } from "./types";
import type { PermissionConfig } from "@/entities/permissions";
import { canShowSidebarItem } from "@/shared/lib/permissions";

// =============================================================================
// Маппинг элементов сайдбара на разрешения
// =============================================================================

export const SIDEBAR_PERMISSIONS_MAP: Record<string, string> = {
  dashboard: "dashboard",
  projects: "projects",
  requirements: "requirements",
  releases: "releases",
  testing: "testing",
  reports: "reports",
  teams: "teams",
  users: "users",
  admin: "admin",
};

// =============================================================================
// Фильтрация с использованием новой системы разрешений
// =============================================================================

/**
 * Фильтрует элементы сайдбара на основе разрешений пользователя
 * @param items - элементы сайдбара
 * @param permissions - разрешения пользователя
 * @returns отфильтрованные элементы
 */
export const filterItemsByPermissions = (
  items: SidebarItem[],
  permissions: PermissionConfig | null
): SidebarItem[] => {
  if (!permissions) {
    return [];
  }

  return items
    .filter((item) => {
      // Проверяем разрешение через массив sidebarItems
      const isAllowed = permissions.sidebarItems?.includes(item.id) ?? false;
      return isAllowed;
    })
    .map((item) => ({
      ...item,
      children: item.children
        ? filterItemsByPermissions(item.children, permissions)
        : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0);
};

/**
 * Legacy функция для обратной совместимости
 * @deprecated Используйте filterItemsByPermissions
 */
export const filterItemsByRole = (
  items: SidebarItem[],
  userRole: UserRole
): SidebarItem[] => {
  return items
    .filter((item) => {
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

// =============================================================================
// Утилиты для работы с группировкой
// =============================================================================

/**
 * Группирует элементы по категориям
 */
export const groupItemsByCategory = (items: SidebarItem[]) => {
  const groups = items.reduce((groups, item) => {
    const category = item.metadata?.category || "main";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, SidebarItem[]>);

  return groups;
};

/**
 * Проверяет видимость элемента на основе разрешений
 */
export const isItemVisible = (
  item: SidebarItem,
  permissions: PermissionConfig | null
): boolean => {
  if (!permissions) {
    return false;
  }

  const permissionKey = SIDEBAR_PERMISSIONS_MAP[item.id];
  if (permissionKey) {
    return canShowSidebarItem(permissions, permissionKey);
  }

  return true;
};
