import { ElementType } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { SortingStrategy } from "@dnd-kit/sortable";

export interface SidebarItem {
  id: UniqueIdentifier;
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
  data?: Record<string, any>;
}

export interface SidebarConfig {
  width: number;
  collapsedWidth: number;
  animationDuration: number;
  iconSize: "small" | "medium" | "large";
  allowReorder: boolean;
  persistOrder: boolean;
  storageKey: string;
  sortingStrategy?: SortingStrategy;
}

export interface SidebarState {
  isCollapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
  isPinned: boolean;
  expandedItems: UniqueIdentifier[];
  activeItem: UniqueIdentifier | null;
  itemOrder: UniqueIdentifier[];
  isDragging: boolean;
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
}

export interface DragData {
  type: "sidebar-item";
  item: SidebarItem;
  sortable: {
    containerId: UniqueIdentifier;
    index: number;
  };
}

export interface DropData {
  type: "sidebar-container";
  accepts: string[];
}

export type SidebarActions = {
  toggleCollapse: () => void;
  resetSidebar: () => void;
  toggleExpanded: (itemId: UniqueIdentifier) => void;
  setActiveItem: (itemId: UniqueIdentifier | null) => void;
  setOpen: (isOpen: boolean) => void;
  setPinned: (isPinned: boolean) => void;
  setMobile: (isMobile: boolean) => void;
  reorderItems: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => void;
  setDragging: (isDragging: boolean, activeId?: UniqueIdentifier | null) => void;
  resetOrder: () => void;
  saveOrder: () => void;
  loadOrder: () => void;
  resetToDefaultOrder: () => void;
  setActiveId: (activeId: UniqueIdentifier | null) => void;
  setOverId: (overId: UniqueIdentifier | null) => void;
};

export type SidebarStore = SidebarState & SidebarActions;

// Дополнительные типы для улучшенной типизации
export interface SidebarDragEvent {
  active: {
    id: UniqueIdentifier;
    data: { current?: DragData };
  };
  over?: {
    id: UniqueIdentifier;
    data: { current?: DropData };
  } | null;
}

export interface SidebarAccessibilityConfig {
  restoreFocus?: boolean;
  announcements?: {
    onDragStart?: (id: UniqueIdentifier) => string;
    onDragMove?: (id: UniqueIdentifier, overId?: UniqueIdentifier) => string;
    onDragOver?: (id: UniqueIdentifier, overId?: UniqueIdentifier) => string;
    onDragEnd?: (id: UniqueIdentifier, overId?: UniqueIdentifier) => string;
    onDragCancel?: (id: UniqueIdentifier) => string;
  };
}
