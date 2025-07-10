export interface SidebarState {
  isCollapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
  isPinned: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  color?: string;
  badge?: number;
  children?: SidebarItem[];
  disabled?: boolean;
  visible?: boolean;
  isNew?: boolean;
}   

export interface SidebarGroup {
  id: string;
  title: string;
  items: SidebarItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface SidebarConfig {
  width: number;
  collapsedWidth: number;
  animationDuration: number;
  showLabels: boolean;
  showBadges: boolean;
  enableTooltips: boolean;
}
