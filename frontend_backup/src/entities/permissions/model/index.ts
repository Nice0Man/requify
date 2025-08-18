/**
 * Permissions Entity Model - Экспорт модели разрешений
 */

export type {
  Permission,
  PermissionRule,
  PermissionConfig,
  PermissionsState,
  PermissionCheckParams,
  PermissionResource,
  PermissionAction,
  UserRole,
} from "./types";

export { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from "./types";

export {
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  roleHasPermission,
  roleCanShowSidebarItem,
} from "./config";
