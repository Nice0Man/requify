import { ElementType } from "react";

export interface SidebarItem {
  id: string;
  label: string;
  icon: ElementType;
  path?: string;
  color?: string;
  badge?: number;
  isNew?: boolean;
  order: number;
  children?: SidebarItem[];
  isCollapsible?: boolean;
  isDraggable?: boolean;
}

export interface SidebarConfig {
  width: number;
  collapsedWidth: number;
  animationDuration: number;
  iconSize: "small" | "medium" | "large";
  allowReorder: boolean;
  persistOrder: boolean;
  storageKey: string;
}

export interface SidebarState {
  isCollapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
  isPinned: boolean;
  expandedItems: string[];
  activeItem: string | null;
  itemOrder: string[];
  isDragging: boolean;
  dragItemId: string | null;
}

export interface DragItem {
  id: string;
  type: string;
  index: number;
}

export interface DropResult {
  dragIndex: number;
  hoverIndex: number;
  dragId: string;
}

export type SidebarActions = {
  toggleCollapse: () => void;
  resetSidebar: () => void;
  toggleExpanded: (itemId: string) => void;
  setActiveItem: (itemId: string | null) => void;
  setOpen: (isOpen: boolean) => void;
  setPinned: (isPinned: boolean) => void;
  setMobile: (isMobile: boolean) => void;
  reorderItems: (dragIndex: number, hoverIndex: number) => void;
  setDragging: (isDragging: boolean, dragItemId?: string) => void;
  resetOrder: () => void;
  saveOrder: () => void;
  loadOrder: () => void;
  resetToDefaultOrder: () => void;
};

export type SidebarStore = SidebarState & SidebarActions;
