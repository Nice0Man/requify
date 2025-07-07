// Permission checking utilities
// Note: This is a shared hook, so we define basic types locally instead of importing from entities

type BasicUserRole = "admin" | "manager" | "user" | "viewer";

export const usePermissions = () => {
  // Mock implementation for now - should be replaced with real auth context
  const hasPermission = (_permission: string): boolean => {
    return true; // Allow all permissions for demo
  };

  const hasRole = (_role: BasicUserRole): boolean => {
    return true; // Allow all roles for demo
  };

  const hasAnyPermission = (_permissions: string[]): boolean => {
    return true;
  };

  const hasAllPermissions = (_permissions: string[]): boolean => {
    return true;
  };

  // Additional methods expected by components
  const canAccessRoute = (_route: string): boolean => {
    return true; // Allow all routes for demo
  };

  const isAdmin = (): boolean => {
    return true; // Mock admin for demo
  };

  const isSuperuser = (): boolean => {
    return true; // Mock superuser for demo
  };

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    isAdmin,
    isSuperuser,
    canViewAdminPanel: () => true,
    canManageUsers: () => true,
    canManageProjects: () => true,
  };
};
