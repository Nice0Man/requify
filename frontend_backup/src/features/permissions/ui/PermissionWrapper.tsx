/**
 * PermissionWrapper Component - Компонент-обертка для инъекции разрешений
 * Передает props с разрешениями в дочерние компоненты
 */

import React, { ReactNode, useMemo, useCallback } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { Can } from "./Can";

// =============================================================================
// Типы компонента PermissionWrapper
// =============================================================================

interface PermissionWrapperProps {
  children: ReactNode;

  // Разрешения для проверки
  resource?: string;
  action?: string;
  anyOf?: Array<[string, string]>;
  allOf?: Array<[string, string]>;
  page?: string;
  role?: string | string[];

  // Дополнительные props для передачи
  permissionProps?: Record<string, any>;
}

interface PermissionChildProps {
  hasPermission: boolean;
  permissions: Record<string, boolean>;
  userRole?: string;
}

// =============================================================================
// Утилиты для проверки разрешений
// =============================================================================

const checkPermissionAccess = (
  {
    user,
    hasPermission: checkPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessPage,
  }: ReturnType<typeof usePermissions>,
  {
    role,
    page,
    anyOf,
    allOf,
    resource,
    action,
  }: Pick<
    PermissionWrapperProps,
    "role" | "page" | "anyOf" | "allOf" | "resource" | "action"
  >
): boolean => {
  // Проверка роли пользователя
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    return Boolean(user?.role && roles.includes(user.role));
  }

  // Проверка доступа к странице
  if (page) {
    return canAccessPage(page);
  }

  // Проверка множественных разрешений (ИЛИ)
  if (anyOf?.length) {
    return hasAnyPermission(anyOf);
  }

  // Проверка множественных разрешений (И)
  if (allOf?.length) {
    return hasAllPermissions(allOf);
  }

  // Проверка конкретного разрешения
  if (resource && action) {
    return checkPermission(resource, action);
  }

  // Если ничего не указано, разрешаем доступ
  return true;
};

// =============================================================================
// Компонент PermissionWrapper
// =============================================================================

/**
 * Компонент для оборачивания дочерних элементов и передачи им props с разрешениями
 *
 * @example
 * <PermissionWrapper resource="projects" action="create">
 *   <ProjectForm />
 *   <ProjectButton />
 * </PermissionWrapper>
 *
 * // Дочерние компоненты получат prop hasPermission: boolean
 *
 * @example
 * // Множественные проверки
 * <PermissionWrapper
 *   anyOf={[['projects', 'edit'], ['projects', 'manage']]}
 *   permissionProps={{ canEdit: true }}
 * >
 *   <ProjectActions />
 * </PermissionWrapper>
 */
export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  resource,
  action,
  anyOf,
  allOf,
  page,
  role,
  permissionProps = {},
}) => {
  const permissions = usePermissions();
  const { user, hasPermission: checkPermission } = permissions;

  // =============================================================================
  // Мемоизированная логика проверки разрешений
  // =============================================================================

  const hasPermission = useMemo(() => {
    return checkPermissionAccess(permissions, {
      role,
      page,
      anyOf,
      allOf,
      resource,
      action,
    });
  }, [permissions, role, page, anyOf, allOf, resource, action]);

  // Формируем дополнительный объект с детальными разрешениями
  const detailedPermissions = useMemo(
    () => ({
      hasMainPermission: hasPermission,
      canView: resource ? checkPermission(resource, "view") : false,
      canCreate: resource ? checkPermission(resource, "create") : false,
      canEdit: resource ? checkPermission(resource, "edit") : false,
      canDelete: resource ? checkPermission(resource, "delete") : false,
      canManage: resource ? checkPermission(resource, "manage") : false,
    }),
    [hasPermission, resource, checkPermission]
  );

  // =============================================================================
  // Мемоизированная обработка дочерних элементов
  // =============================================================================

  const wrappedChildren = useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement<PermissionChildProps>(child)) {
        return React.cloneElement(child, {
          hasPermission,
          permissions: detailedPermissions,
          userRole: user?.role,
          ...permissionProps,
        });
      }
      return child;
    });
  }, [
    children,
    hasPermission,
    detailedPermissions,
    user?.role,
    permissionProps,
  ]);

  return <>{wrappedChildren}</>;
};

// =============================================================================
// HOC версия PermissionWrapper
// =============================================================================

/**
 * Higher-Order Component для добавления разрешений к компоненту
 *
 * @example
 * const ProjectFormWithPermissions = withPermissions(ProjectForm, {
 *   resource: 'projects',
 *   action: 'create'
 * });
 */
export const withPermissions = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permissionConfig: {
    resource?: string;
    action?: string;
    anyOf?: Array<[string, string]>;
    allOf?: Array<[string, string]>;
    page?: string;
    role?: string | string[];
    fallbackComponent?: React.ComponentType<any>;
  }
) => {
  const WithPermissions: React.FC<P> = (props) => {
    return (
      <PermissionWrapper {...permissionConfig}>
        <WrappedComponent {...props} />
      </PermissionWrapper>
    );
  };

  WithPermissions.displayName = `WithPermissions(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithPermissions;
};

// =============================================================================
// Компонент для условного рендеринга с детальной информацией
// =============================================================================

interface PermissionSwitchProps {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}

/**
 * Компонент-переключатель для условного рендеринга на основе разрешений
 * Аналог Switch из react-router, но для разрешений
 *
 * @example
 * <PermissionSwitch>
 *   <Can resource="projects" action="manage">
 *     <FullProjectPanel />
 *   </Can>
 *   <Can resource="projects" action="view">
 *     <ReadOnlyProjectPanel />
 *   </Can>
 *   <div>Нет доступа</div>
 * </PermissionSwitch>
 */
export const PermissionSwitch: React.FC<PermissionSwitchProps> = ({
  children,
  fallback = null,
  loading = null,
}) => {
  const permissions = usePermissions();
  const { isLoading } = permissions;

  const checkCanAccess = useCallback(
    (props: any): boolean => {
      let hasAccess = checkPermissionAccess(permissions, {
        role: props.role,
        page: props.page,
        anyOf: props.anyOf,
        allOf: props.allOf,
        resource: props.resource,
        action: props.action,
      });

      // Инверсия логики если указано
      if (props.not) {
        hasAccess = !hasAccess;
      }

      return hasAccess;
    },
    [permissions]
  );

  const firstAllowedChild = useMemo(() => {
    if (isLoading) {
      return loading;
    }

    const childrenArray = React.Children.toArray(children);

    for (const child of childrenArray) {
      if (React.isValidElement(child) && child.type === Can) {
        const props = child.props as any;

        if (checkCanAccess(props)) {
          return child;
        }
      } else if (React.isValidElement(child)) {
        // Если это не Can компонент, возвращаем его как fallback
        return child;
      }
    }

    return fallback;
  }, [isLoading, children, loading, fallback, checkCanAccess]);

  return <>{firstAllowedChild}</>;
};
