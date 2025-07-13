import { SidebarConfig } from "./types";

export const sidebarConfig: SidebarConfig = {
  width: 280,
  collapsedWidth: 72,
  animationDuration: 300,
  iconSize: "large",
  allowReorder: true,
  persistOrder: true,
  storageKey: "sidebar-config",
};

export const SIDEBAR_CONSTANTS = {
  DRAG_TYPE: "SIDEBAR_ITEM",
  HEADER_HEIGHT: 64,
  ITEM_HEIGHT: 56,
  ITEM_MIN_HEIGHT: 48,
  LONG_PRESS_DURATION: 500,
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
} as const;
