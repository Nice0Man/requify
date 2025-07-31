/**
 * Interface Settings Feature Types
 */

import type { InterfaceSettings } from "@/entities/user-settings";

export interface InterfaceSettingsFormData extends InterfaceSettings {
  _hasChanges?: boolean;
}

export interface InterfaceSettingsState {
  data: InterfaceSettingsFormData;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
}

export interface ThemeOption {
  value: "light" | "dark" | "auto";
  label: string;
  description: string;
  icon: React.ReactNode;
}

export interface LanguageOption {
  value: string;
  label: string;
  flag: string;
}

export interface InterfaceSettingOption {
  key: keyof InterfaceSettings;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  type: "switch" | "select" | "number" | "slider";
  options?: Array<{ value: any; label: string; description?: string }>;
  min?: number;
  max?: number;
  step?: number;
}

export interface InterfaceSettingsGroup {
  id: string;
  title: string;
  description: string;
  settings: InterfaceSettingOption[];
} 