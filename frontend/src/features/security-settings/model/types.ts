/**
 * Security Settings Feature Types
 */

import type { SecuritySettings } from "@/entities/user-settings";

export interface SecuritySettingsFormData extends SecuritySettings {
  _hasChanges?: boolean;
}

export interface SecuritySettingsState {
  data: SecuritySettingsFormData;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
}

export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SessionItem {
  id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  last_active: string;
  is_current: boolean;
}

export interface SecuritySettingOption {
  key: keyof SecuritySettings;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  type: "switch" | "number" | "select";
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
}

export interface SecuritySettingsGroup {
  id: string;
  title: string;
  description: string;
  settings: SecuritySettingOption[];
} 