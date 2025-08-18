/**
 * Permission Hooks - Хуки для работы с разрешениями
 * Features layer согласно FSD архитектуре
 */

import { useContext, useMemo } from "react";
import { createContext } from "react";

// Entities (разрешены в features)
import type { PermissionConfig } from "@/entities/permissions";
import type { User } from "@/entities/user/model/types";

// Shared utilities (разрешены в features)
import { useMemoizedPermissionCheck } from "@/shared/lib/permissions";

// =============================================================================
// Контекст разрешений
// =============================================================================

export interface PermissionsContextValue {
  user: User | null;
  permissions: PermissionConfig | null;
  isLoading: boolean;
  error: string | null;

  // Основные методы проверки
  hasPermission: (resource: string, action: string) => boolean;
  hasAnyPermission: (checks: Array<[string, string]>) => boolean;
  hasAllPermissions: (checks: Array<[string, string]>) => boolean;

  // Специализированные методы
  canAccessPage: (pageName: string) => boolean;
  canShowSidebarItem: (itemName: string) => boolean;
}

export const PermissionsContext = createContext<PermissionsContextValue | null>(
  null
);

// =============================================================================
// Основной хук разрешений
// =============================================================================

/**
 * Основной хук для работы с разрешениями
 * @returns контекст разрешений
 * @throws ошибка если используется вне PermissionsProvider
 */
export const usePermissions = (): PermissionsContextValue => {
  const context = useContext(PermissionsContext);

  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }

  return context;
};

// =============================================================================
// Специализированные хуки
// =============================================================================

/**
 * Хук для проверки конкретного разрешения
 * @param resource - ресурс
 * @param action - действие
 * @returns true если разрешение есть
 */
export const useCanAccess = (resource: string, action: string): boolean => {
  const { permissions } = usePermissions();

  // Используем мемоизированную версию для оптимизации
  return useMemoizedPermissionCheck(permissions, resource, action);
};

/**
 * Хук для проверки доступа к странице
 * @param pageName - название страницы
 * @returns true если доступ разрешен
 */
export const useCanAccessPage = (pageName: string): boolean => {
  const { canAccessPage } = usePermissions();

  return useMemo(() => {
    return canAccessPage(pageName);
  }, [canAccessPage, pageName]);
};

/**
 * Хук для проверки отображения элемента сайдбара
 * @param itemName - название элемента
 * @returns true если элемент можно отображать
 */
export const useCanShowSidebarItem = (itemName: string): boolean => {
  const { canShowSidebarItem } = usePermissions();

  return useMemo(() => {
    return canShowSidebarItem(itemName);
  }, [canShowSidebarItem, itemName]);
};

/**
 * Хук для проверки множественных разрешений (ИЛИ)
 * @param checks - массив проверок [resource, action]
 * @returns true если хотя бы одно разрешение есть
 */
export const useCanAccessAny = (checks: Array<[string, string]>): boolean => {
  const { hasAnyPermission } = usePermissions();

  return useMemo(() => {
    return hasAnyPermission(checks);
  }, [hasAnyPermission, checks]);
};

/**
 * Хук для проверки множественных разрешений (И)
 * @param checks - массив проверок [resource, action]
 * @returns true если все разрешения есть
 */
export const useCanAccessAll = (checks: Array<[string, string]>): boolean => {
  const { hasAllPermissions } = usePermissions();

  return useMemo(() => {
    return hasAllPermissions(checks);
  }, [hasAllPermissions, checks]);
};

// =============================================================================
// Композитные хуки для типичных случаев
// =============================================================================

/**
 * Хук для проверки административных прав
 * @returns объект с флагами административных разрешений
 */
export const useAdminPermissions = () => {
  const { permissions, user } = usePermissions();

  return useMemo(
    () => ({
      isAdmin: user?.role === "admin",
      canViewAdmin: permissions?.canViewAdmin ?? false,
      canManageSystem: permissions?.canManageSystem ?? false,
      canManageUsers: permissions?.canManageUsers ?? false,
      canManagePermissions: permissions?.canManagePermissions ?? false,
    }),
    [permissions, user]
  );
};

/**
 * Хук для проверки прав на проекты
 * @returns объект с флагами разрешений для проектов
 */
export const useProjectPermissions = () => {
  const { permissions } = usePermissions();

  return useMemo(
    () => ({
      canView: permissions?.canViewProjects ?? false,
      canCreate: permissions?.canCreateProjects ?? false,
      canEdit: permissions?.canEditProjects ?? false,
      canDelete: permissions?.canDeleteProjects ?? false,
      canManage: permissions?.canManageProjects ?? false,
    }),
    [permissions]
  );
};

/**
 * Хук для проверки прав на требования
 * @returns объект с флагами разрешений для требований
 */
export const useRequirementPermissions = () => {
  const { permissions } = usePermissions();

  return useMemo(
    () => ({
      canView: permissions?.canViewRequirements ?? false,
      canCreate: permissions?.canCreateRequirements ?? false,
      canEdit: permissions?.canEditRequirements ?? false,
      canDelete: permissions?.canDeleteRequirements ?? false,
      canManage: permissions?.canManageRequirements ?? false,
    }),
    [permissions]
  );
};

/**
 * Хук для проверки прав на тестирование
 * @returns объект с флагами разрешений для тестирования
 */
export const useTestingPermissions = () => {
  const { permissions } = usePermissions();

  return useMemo(
    () => ({
      canView: permissions?.canViewTesting ?? false,
      canManage: permissions?.canManageTesting ?? false,
      canCreate: permissions?.canCreateTests ?? false,
      canExecute: permissions?.canExecuteTests ?? false,
    }),
    [permissions]
  );
};
