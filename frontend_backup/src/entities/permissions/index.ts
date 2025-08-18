/**
 * Permissions Entity - Сущность разрешений
 * Feature-Sliced Design архитектура
 */

// Model layer - базовая логика и типы
export type {
  Permission,
  PermissionRule,
  PermissionConfig,
  PermissionsState,
  PermissionCheckParams,
  PermissionResource,
  PermissionAction,
  UserRole,
} from "./model";

export {
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  roleHasPermission,
  roleCanShowSidebarItem,
} from "./model";
