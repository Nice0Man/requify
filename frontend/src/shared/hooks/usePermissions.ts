import { useCallback } from 'react';
import { useAuth } from '@/features/auth/context/auth.context';

export interface PermissionConfig {
  // Projects
  'projects:read': string;
  'projects:write': string;
  'projects:delete': string;
  
  // Requirements  
  'requirements:read': string;
  'requirements:write': string;
  'requirements:delete': string;
  
  // Releases
  'releases:read': string;
  'releases:write': string;
  'releases:delete': string;
  
  // Testing
  'testing:read': string;
  'testing:write': string;
  'testing:execute': string;
  
  // Admin
  'admin:read': string;
  'admin:write': string;
  'system:admin': string;
  
  // Users
  'users:read': string;
  'users:write': string;
  'users:delete': string;
  
  // Base
  'me': string;
}

/**
 * Enhanced permissions hook for comprehensive access control
 */
export const usePermissions = () => {
  const { user, permissions } = useAuth();

  // Ensure permissions is always an array
  const safePermissions = permissions || [];

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback(
    (permission: keyof PermissionConfig): boolean => {
      return safePermissions.includes(permission);
    },
    [safePermissions]
  );

  /**
   * Check if user has any of the required permissions
   */
  const hasAnyPermission = useCallback(
    (requiredPermissions: (keyof PermissionConfig)[]): boolean => {
      if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        return true; // No permissions required
      }
      return requiredPermissions.some((permission) =>
        safePermissions.includes(permission)
      );
    },
    [safePermissions]
  );

  /**
   * Check if user has all required permissions
   */
  const hasAllPermissions = useCallback(
    (requiredPermissions: (keyof PermissionConfig)[]): boolean => {
      if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        return true; // No permissions required
      }
      return requiredPermissions.every((permission) =>
        safePermissions.includes(permission)
      );
    },
    [safePermissions]
  );

  /**
   * Check role-based permissions (for UI elements)
   */
  const hasRole = useCallback(
    (roles: string | string[]): boolean => {
      if (!user?.role) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user?.role]
  );

  /**
   * Check if user is admin or superuser
   */
  const isAdmin = useCallback((): boolean => {
    return user?.is_superuser || 
           user?.role === 'admin' || 
           hasAnyPermission(['admin:read', 'admin:write']);
  }, [user, hasAnyPermission]);

  /**
   * Check if user is superuser
   */
  const isSuperuser = useCallback((): boolean => {
    return user?.is_superuser || hasPermission('system:admin');
  }, [user, hasPermission]);

  // Specific permission checkers for common operations
  const canReadProjects = useCallback(() => hasPermission('projects:read'), [hasPermission]);
  const canWriteProjects = useCallback(() => hasPermission('projects:write'), [hasPermission]);
  const canDeleteProjects = useCallback(() => hasPermission('projects:delete'), [hasPermission]);

  const canReadRequirements = useCallback(() => hasPermission('requirements:read'), [hasPermission]);
  const canWriteRequirements = useCallback(() => hasPermission('requirements:write'), [hasPermission]);
  const canDeleteRequirements = useCallback(() => hasPermission('requirements:delete'), [hasPermission]);

  const canReadReleases = useCallback(() => hasPermission('releases:read'), [hasPermission]);
  const canWriteReleases = useCallback(() => hasPermission('releases:write'), [hasPermission]);
  const canDeleteReleases = useCallback(() => hasPermission('releases:delete'), [hasPermission]);

  const canReadTesting = useCallback(() => hasPermission('testing:read'), [hasPermission]);
  const canWriteTesting = useCallback(() => hasPermission('testing:write'), [hasPermission]);
  const canExecuteTesting = useCallback(() => hasPermission('testing:execute'), [hasPermission]);

  const canReadUsers = useCallback(() => hasPermission('users:read'), [hasPermission]);
  const canWriteUsers = useCallback(() => hasPermission('users:write'), [hasPermission]);
  const canDeleteUsers = useCallback(() => hasPermission('users:delete'), [hasPermission]);

  const canReadAdmin = useCallback(() => hasPermission('admin:read'), [hasPermission]);
  const canWriteAdmin = useCallback(() => hasPermission('admin:write'), [hasPermission]);

  /**
   * Comprehensive permission checker for UI elements
   */
  const canAccess = useCallback(
    (resource: 'projects' | 'requirements' | 'releases' | 'testing' | 'admin' | 'users', 
     action: 'read' | 'write' | 'delete'): boolean => {
      const permission = `${resource}:${action}` as keyof PermissionConfig;
      return hasPermission(permission);
    },
    [hasPermission]
  );

  /**
   * Check permissions for TZ compliance - Product Manager functions
   */
  const canManageRequirements = useCallback((): boolean => {
    // Product Manager can create/edit/delete requirements per TZ
    return hasRole(['product_manager', 'admin']) || hasAllPermissions(['requirements:write', 'requirements:delete']);
  }, [hasRole, hasAllPermissions]);

  const canManageProjects = useCallback((): boolean => {
    // Product Manager can create/delete projects per TZ
    return hasRole(['product_manager', 'admin']) || hasAllPermissions(['projects:write', 'projects:delete']);
  }, [hasRole, hasAllPermissions]);

  const canManageReleases = useCallback((): boolean => {
    // Product Manager can form releases per TZ
    return hasRole(['product_manager', 'manager', 'senior_developer', 'admin']) || hasPermission('releases:write');
  }, [hasRole, hasPermission]);

  /**
   * Check if user can access navigation item
   */
  const canAccessRoute = useCallback(
    (route: string): boolean => {
      switch (route) {
        case '/projects':
          return canReadProjects();
        case '/requirements':
          return canReadRequirements();
        case '/releases':
          return canReadReleases();
        case '/testing':
          return canReadTesting();
        case '/admin':
          return canReadAdmin();
        case '/dashboard':
          return true; // All authenticated users can access dashboard
        default:
          return true;
      }
    },
    [canReadProjects, canReadRequirements, canReadReleases, canReadTesting, canReadAdmin]
  );

  return {
    // Basic permission checks
    permissions: safePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasPermissions: hasAllPermissions, // Alias for backward compatibility
    hasRole,
    
    // Admin checks
    isAdmin,
    isSuperuser,
    
    // Specific permission checks
    canReadProjects,
    canWriteProjects,
    canDeleteProjects,
    canReadRequirements,
    canWriteRequirements,
    canDeleteRequirements,
    canReadReleases,
    canWriteReleases,
    canDeleteReleases,
    canReadTesting,
    canWriteTesting,
    canExecuteTesting,
    canReadUsers,
    canWriteUsers,
    canDeleteUsers,
    canReadAdmin,
    canWriteAdmin,
    
    // Comprehensive access checker
    canAccess,
    
    // TZ compliance checkers
    canManageRequirements,
    canManageProjects,
    canManageReleases,
    
    // Route access checker
    canAccessRoute,
  };
}; 