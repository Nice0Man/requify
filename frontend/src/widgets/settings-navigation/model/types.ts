/**
 * Settings Navigation Widget Types
 */

import type { SettingsTabItem } from "@/entities/settings";

export interface SettingsNavigationProps {
  activeTab: number;
  onTabChange: (tabIndex: number) => void;
  tabs: SettingsTabItem[];
  isLoading?: boolean;
}

export interface TabItemProps {
  tab: SettingsTabItem;
  index: number;
  isActive: boolean;
  onClick: () => void;
} 