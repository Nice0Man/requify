// App Sidebar Widget - композитный виджет для управления навигацией
export { AppSidebarWidget, type AppSidebarProps } from "./ui/AppSidebarWidget";
export { AppSidebarView, type AppSidebarViewProps, type AppSidebarConfig } from "./ui/AppSidebarView";
export { useAppSidebar, type AppSidebarState, type UseAppSidebarReturn } from "./model/useAppSidebar";

// Реэкспорт базовых сущностей для удобства
export type {
  SidebarItem,
  SidebarItemState,
  SidebarUserPreferences,
  SidebarConfig,
} from "@/entities/sidebar";

export {
  SidebarButton,
  SidebarGroup,
  UserProfile,
  getDefaultSidebarItems,
  filterItemsByRole,
  groupItemsByCategory,
  DEFAULT_SIDEBAR_CONFIG,
} from "@/entities/sidebar";
