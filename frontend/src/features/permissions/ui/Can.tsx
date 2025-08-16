/**
 * Can Component - Компонент условного рендеринга на основе разрешений
 * Inspired by react-permissions patterns
 */

import React, { ReactNode } from "react";
import { usePermissions } from "../hooks/usePermissions";

// =============================================================================
// Типы компонента Can
// =============================================================================

interface CanProps {
  children: ReactNode | ((allowed: boolean) => ReactNode);

  // Проверка конкретного разрешения
  resource?: string;
  action?: string;

  // Проверка множественных разрешений
  anyOf?: Array<[string, string]>;
  allOf?: Array<[string, string]>;

  // Проверка доступа к странице
  page?: string;

  // Проверка роли пользователя
  role?: string | string[];

  // Инверсия логики (показать если НЕ разрешено)
  not?: boolean;

  // Компонент для отображения при отсутствии разрешения
  fallback?: ReactNode;
}

// =============================================================================
// Компонент Can
// =============================================================================

/**
 * Компонент для условного рендеринга на основе разрешений пользователя
 *
 * @example
 * // Простая проверка разрешения
 * <Can resource="projects" action="create">
 *   <button>Создать проект</button>
 * </Can>
 *
 * @example
 * // Проверка множественных разрешений (ИЛИ)
 * <Can anyOf={[['projects', 'edit'], ['projects', 'manage']]}>
 *   <button>Редактировать</button>
 * </Can>
 *
 * @example
 * // Проверка роли
 * <Can role="admin">
 *   <AdminPanel />
 * </Can>
 *
 * @example
 * // Функция как дочерний элемент
 * <Can resource="users" action="delete">
 *   {(allowed) => (
 *     <button disabled={!allowed}>
 *       {allowed ? 'Удалить' : 'Нет прав'}
 *     </button>
 *   )}
 * </Can>
 */
export const Can: React.FC<CanProps> = ({
  children,
  resource,
  action,
  anyOf,
  allOf,
  page,
  role,
  not = false,
  fallback = null,
}) => {
  const {
    user,
    hasPermission: checkPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessPage,
  } = usePermissions();

  // =============================================================================
  // Логика проверки разрешений
  // =============================================================================

  const checkAccess = (): boolean => {
    // Проверка роли пользователя
    if (role) {
      const roles = Array.isArray(role) ? role : [role];
      const hasRole = user?.role && roles.includes(user.role);
      if (!hasRole) return false;
    }

    // Проверка доступа к странице
    if (page) {
      return canAccessPage(page);
    }

    // Проверка множественных разрешений (ИЛИ)
    if (anyOf && anyOf.length > 0) {
      return hasAnyPermission(anyOf);
    }

    // Проверка множественных разрешений (И)
    if (allOf && allOf.length > 0) {
      return hasAllPermissions(allOf);
    }

    // Проверка конкретного разрешения
    if (resource && action) {
      return checkPermission(resource, action);
    }

    // Если ничего не указано, разрешаем доступ
    return true;
  };

  // Применяем инверсию если нужно
  const allowed = not ? !checkAccess() : checkAccess();

  // =============================================================================
  // Рендеринг
  // =============================================================================

  // Если children - функция, передаем ей результат проверки
  if (typeof children === "function") {
    return <>{children(allowed)}</>;
  }

  // Обычный условный рендеринг
  return allowed ? <>{children}</> : <>{fallback}</>;
};

// =============================================================================
// Компонент PermissionGate (алиас для Can)
// =============================================================================

/**
 * Алиас для компонента Can с более явным названием
 */
export const PermissionGate = Can;
