import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SidebarConfig } from "./types";

export const sidebarConfig: SidebarConfig = {
  width: 280,
  collapsedWidth: 72,
  animationDuration: 250, // Быстрее для более отзывчивого UI
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
      overName
        ? `${itemName} размещен над ${overName}`
        : `Перетаскивание ${itemName} завершено`,
    onDragCancel: (itemName: string) => `Перетаскивание ${itemName} отменено`,
  },
} as const;

// Z-index hierarchy for sidebar components
export const SIDEBAR_Z_INDEX = {
  // Основной сайдбар (должен быть выше обычного контента, но ниже модалов)
  sidebar: 1200, // Используем стандартное значение drawer из Material-UI

  // Мобильная заглушка (ниже сайдбара)
  mobileBackdrop: 1199,

  // DND элементы (выше сайдбара во время перетаскивания)
  dragOverlay: 1300,
  draggingItem: 1250,
  dropIndicator: 1260,
  dragEffects: 1210,

  // Контролы редактирования (выше сайдбара, но ниже DND)
  editControls: 1220,
  resetButton: 1220,

  // Tooltip'ы (самый высокий приоритет)
  tooltip: 1500,
} as const;
