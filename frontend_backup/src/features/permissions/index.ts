/**
 * Permissions Feature - Функциональность управления разрешениями
 * Feature-Sliced Design архитектура
 */

// Hooks layer - хуки для работы с разрешениями
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
} from "./hooks";

export type { PermissionsContextValue } from "./hooks";

// UI layer - компоненты для условного рендеринга
export {
  Can,
  PermissionGate,
  PermissionWrapper,
  withPermissions,
  PermissionSwitch,
} from "./ui";
