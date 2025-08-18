/**
 * Permissions Utilities - Утилиты для работы с разрешениями
 * Shared layer согласно FSD архитектуре
 */

export {
  hasPermission,
  useMemoizedPermissionCheck,
  hasAnyPermission,
  hasAllPermissions,
  canAccessPage,
  canShowSidebarItem,
} from './hasPermission'; 