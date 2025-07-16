import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SidebarConfig } from "./types";

export const sidebarConfig: SidebarConfig = {
  width: 280,
  collapsedWidth: 72,
  animationDuration: 300,
  iconSize: "large",
  allowReorder: true,
  persistOrder: true,
  storageKey: "sidebar-config",
  sortingStrategy: verticalListSortingStrategy,
};

export const SIDEBAR_CONSTANTS = {
  DRAG_TYPE: "SIDEBAR_ITEM",
  HEADER_HEIGHT: 64,
  ITEM_HEIGHT: 56,
  ITEM_MIN_HEIGHT: 48,
  LONG_PRESS_DURATION: 500,
  ACTIVATION_DELAY: 250,
  ACTIVATION_TOLERANCE: 5,
  ICON_SIZES: {
    small: 20,
    medium: 24,
    large: 32,
  },
  BADGE_SIZES: {
    small: "small",
    medium: "medium",
    large: "large",
  },
  // Новые константы для @dnd-kit
  CONTAINER_ID: "sortable-sidebar",
  SENSOR_OPTIONS: {
    delay: 250,
    tolerance: 5,
  },
  ANNOUNCEMENTS: {
    onDragStart: (itemName: string) => `Перетаскивание ${itemName} начато`,
    onDragOver: (itemName: string, overName?: string) => 
      overName ? `${itemName} над ${overName}` : `Перетаскивание ${itemName}`,
    onDragEnd: (itemName: string, overName?: string) => 
      overName ? `${itemName} размещен над ${overName}` : `Перетаскивание ${itemName} завершено`,
    onDragCancel: (itemName: string) => `Перетаскивание ${itemName} отменено`,
  },
} as const;
