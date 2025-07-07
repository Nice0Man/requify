import React from "react";
import { usePermissions } from "@/shared/hooks/usePermissions";
import type { BasicUserRole } from "@/shared/types";

interface PermissionGuardProps {
  children: React.ReactNode;
  /** Required permissions - user must have at least one */
  permissions?: string[];
  /** Required roles - user must have at least one */
  roles?: BasicUserRole[];
  /** All permissions required - user must have all */
  requireAll?: boolean;
  /** Fallback component when access is denied */
  fallback?: React.ReactNode;
  /** Hide instead of showing fallback */
  hideOnDenied?: boolean;
  /** Admin-only access */
  adminOnly?: boolean;
  /** Superuser-only access */
  superuserOnly?: boolean;
}

/**
 * Permission Guard component for conditional rendering based on user permissions
 *
 * @example
 * // Show content only if user can read projects
 * <PermissionGuard permissions={['projects:read']}>
 *   <ProjectsList />
 * </PermissionGuard>
 *
 * @example
 * // Show create button only if user can write projects
 * <PermissionGuard permissions={['projects:write']} fallback={<span>No access</span>}>
 *   <CreateProjectButton />
 * </PermissionGuard>
 *
 * @example
 * // Admin-only section
 * <PermissionGuard adminOnly>
 *   <AdminPanel />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
  hideOnDenied = false,
  adminOnly = false,
  superuserOnly = false,
}) => {
  const { hasAnyPermission, hasAllPermissions, hasRole, isAdmin, isSuperuser } =
    usePermissions();

  // Check superuser access first
  if (superuserOnly && !isSuperuser()) {
    return hideOnDenied ? null : <>{fallback}</>;
  }

  // Check admin access
  if (adminOnly && !isAdmin()) {
    return hideOnDenied ? null : <>{fallback}</>;
  }

  // Check role-based access
  if (roles.length > 0) {
    const hasRequiredRole = roles.some((role) => hasRole(role));
    if (!hasRequiredRole) {
      return hideOnDenied ? null : <>{fallback}</>;
    }
  }

  // Check permission-based access
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return hideOnDenied ? null : <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

/**
 * Hook version for programmatic permission checking
 */
export const usePermissionGuard = () => {
  const permissions = usePermissions();

  const checkAccess = (options: {
    permissions?: string[];
    roles?: BasicUserRole[];
    requireAll?: boolean;
    adminOnly?: boolean;
    superuserOnly?: boolean;
  }) => {
    const {
      permissions: requiredPermissions = [],
      roles = [],
      requireAll = false,
      adminOnly = false,
      superuserOnly = false,
    } = options;

    // Check superuser access first
    if (superuserOnly && !permissions.isSuperuser()) {
      return false;
    }

    // Check admin access
    if (adminOnly && !permissions.isAdmin()) {
      return false;
    }

    // Check role-based access
    if (roles.length > 0) {
      const hasRequiredRole = roles.some((role) => permissions.hasRole(role));
      if (!hasRequiredRole) {
        return false;
      }
    }

    // Check permission-based access
    if (requiredPermissions.length > 0) {
      return requireAll
        ? permissions.hasAllPermissions(requiredPermissions)
        : permissions.hasAnyPermission(requiredPermissions);
    }

    return true;
  };

  return { checkAccess, ...permissions };
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard adminOnly fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const SuperuserOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard superuserOnly fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ProjectsWrite: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard permissions={["projects:write"]} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const RequirementsWrite: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard permissions={["requirements:write"]} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ReleasesWrite: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard permissions={["releases:write"]} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const TestingExecute: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard permissions={["testing:execute"]} fallback={fallback}>
    {children}
  </PermissionGuard>
);
