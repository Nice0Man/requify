import type { ReactNode } from "react";
import type { UserRole } from "@/entities/user";

// Базовый элемент сайдбара
export interface SidebarItem {
  id: string;
  label: string;
  icon: ReactNode | string;
  path?: string;
  onClick?: () => void;
  badge?: SidebarBadge;
  children?: SidebarItem[];
  isGroup?: boolean;
  isDraggable?: boolean;
  allowedRoles?: UserRole[];
  order: number;
  metadata?: SidebarItemMetadata;
}

// Бейдж для элемента сайдбара
export interface SidebarBadge {
  count?: number;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  variant?: "standard" | "dot";
}

// Метаданные элемента сайдбара
export interface SidebarItemMetadata {
  description?: string;
  shortcut?: string;
  isNew?: boolean;
  isAdmin?: boolean;
  category?: "main" | "admin" | "profile" | "bottom";
}

// Состояние элемента сайдбара
export interface SidebarItemState {
  isActive: boolean;
  isHovered: boolean;
  isExpanded?: boolean; // для групп
  isVisible: boolean;
}

// Настройки пользователя для сайдбара
export interface SidebarUserPreferences {
  itemOrder: string[];
  hiddenItems: string[];
  pinnedItems: string[];
  isCollapsed?: boolean;
  expandedGroups?: string[];
}

// Конфигурация сайдбара
export interface SidebarConfig {
  expandedWidth: number;
  collapsedWidth: number;
  animationDuration: number;
  longClickDelay: number;
  longClickTolerance: number;
}

// DTO для сохранения настроек сайдбара
export interface SidebarPreferencesDTO {
  userId: string;
  preferences: SidebarUserPreferences;
  updatedAt: string;
}

// Маппер для преобразования DTO в модель
export const mapSidebarPreferencesDTO = (dto: SidebarPreferencesDTO): SidebarUserPreferences => {
  return {
    itemOrder: dto.preferences.itemOrder || [],
    hiddenItems: dto.preferences.hiddenItems || [],
    pinnedItems: dto.preferences.pinnedItems || [],
    isCollapsed: dto.preferences.isCollapsed ?? true,
    expandedGroups: dto.preferences.expandedGroups || [],
  };
};

// Маппер для преобразования модели в DTO
export const mapSidebarPreferencesToDTO = (
  userId: string,
  preferences: SidebarUserPreferences
): SidebarPreferencesDTO => {
  return {
    userId,
    preferences,
    updatedAt: new Date().toISOString(),
  };
}; 