// Типы
export type {
  SidebarItem,
  SidebarBadge,
  SidebarItemMetadata,
  SidebarItemState,
  SidebarUserPreferences,
  SidebarConfig,
  SidebarPreferencesDTO,
} from "./model/types";

// Константы и утилиты
export {
  DEFAULT_SIDEBAR_CONFIG,
  SIDEBAR_ICON_MAP,
  getDefaultSidebarItems,
  filterItemsByRole,
  groupItemsByCategory,
} from "./model/constants";

// Новые хелперы с поддержкой разрешений
export {
  filterItemsByPermissions,
  isItemVisible,
  SIDEBAR_PERMISSIONS_MAP,
} from "./model/helpers";

// Mappers
export {
  mapSidebarPreferencesDTO,
  mapSidebarPreferencesToDTO,
} from "./model/types";

// API
export {
  SidebarPreferencesDAO,
  sidebarPreferencesQueryKeys,
} from "./api/sidebarApi";

// UI компоненты
export { SidebarButton } from "./ui/SidebarButton";
export { SidebarGroup } from "./ui/SidebarGroup";
export { UserProfile } from "./ui/UserProfile";
