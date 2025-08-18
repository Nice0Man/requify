/**
 * Permissions Hooks - Хуки для работы с разрешениями
 * Features layer hooks согласно FSD архитектуре
 */

export {
  usePermissions,
  useCanAccess,
  useCanAccessPage,
  useCanShowSidebarItem,
  useCanAccessAny,
  useCanAccessAll,
  useAdminPermissions,
  useProjectPermissions,
  useRequirementPermissions,
  useTestingPermissions,
  PermissionsContext,
} from "./usePermissions";

export type { PermissionsContextValue } from "./usePermissions";
