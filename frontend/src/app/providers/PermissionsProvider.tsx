/**
 * Permissions Provider - Провайдер разрешений
 * App layer согласно FSD архитектуре
 * Интегрируется с новой системой разрешений
 */

import React, { useMemo } from "react";

// Entities layer (разрешено в app)
import { getPermissionsForRole } from "@/entities/permissions";
import type { User } from "@/entities/user/model/types";

// Features layer (разрешено в app)
import {
  PermissionsContext,
  type PermissionsContextValue,
} from "@/features/permissions";

// Shared utilities (разрешено в app)
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessPage,
  canShowSidebarItem,
} from "@/shared/lib/permissions";

// =============================================================================
// Типы провайдера
// =============================================================================

interface PermissionsProviderProps {
  user: User | null;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

// =============================================================================
// Провайдер разрешений
// =============================================================================

/**
 * Провайдер разрешений для всего приложения
 * Предоставляет контекст разрешений на основе роли пользователя
 *
 * @example
 * <PermissionsProvider user={currentUser}>
 *   <App />
 * </PermissionsProvider>
 */
export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({
  user,
  children,
  isLoading = false,
  error = null,
}) => {
  // =============================================================================
  // Получение разрешений на основе роли пользователя
  // =============================================================================

  const permissions = useMemo(() => {
    if (!user?.role) {
      return null;
    }

    return getPermissionsForRole(user.role);
  }, [user?.role]);

  // =============================================================================
  // Мемоизированные функции проверки разрешений
  // =============================================================================

  const contextValue = useMemo((): PermissionsContextValue => {
    const checkPermission = (resource: string, action: string): boolean => {
      return hasPermission(permissions, resource, action);
    };

    const checkAnyPermission = (checks: Array<[string, string]>): boolean => {
      return hasAnyPermission(permissions, checks);
    };

    const checkAllPermissions = (checks: Array<[string, string]>): boolean => {
      return hasAllPermissions(permissions, checks);
    };

    const checkPageAccess = (pageName: string): boolean => {
      return canAccessPage(permissions, pageName);
    };

    const checkSidebarItem = (itemName: string): boolean => {
      return canShowSidebarItem(permissions, itemName);
    };

    return {
      user,
      permissions,
      isLoading,
      error,
      hasPermission: checkPermission,
      hasAnyPermission: checkAnyPermission,
      hasAllPermissions: checkAllPermissions,
      canAccessPage: checkPageAccess,
      canShowSidebarItem: checkSidebarItem,
    };
  }, [user, permissions, isLoading, error]);

  // =============================================================================
  // Рендеринг провайдера
  // =============================================================================

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
};

// =============================================================================
// Экспорт legacy типов для обратной совместимости
// =============================================================================

export type { UserRole, PermissionConfig } from "@/entities/permissions";

// Legacy экспорты (deprecated, использовать новые хуки)
export { usePermissions as usePermissionsContext } from "@/features/permissions";
export {
  useCanAccess,
  useCanAccessPage,
  useCanShowSidebarItem,
} from "@/features/permissions";
