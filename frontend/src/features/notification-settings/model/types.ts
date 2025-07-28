/**
 * Notification Settings Feature Types
 */

import type { NotificationSettings, SettingsResponse } from "@/entities/settings";

export interface NotificationFormData extends NotificationSettings {
  _hasChanges?: boolean;
}

export interface NotificationFormState {
  data: NotificationFormData;
  isLoading: boolean;
  isSaving: boolean;
  error?: string;
  isDirty: boolean;
}

export interface NotificationFormActions {
  updateSetting: (key: keyof NotificationSettings, value: boolean) => void;
  saveSettings: () => Promise<SettingsResponse>;
  resetForm: () => void;
  enableAll: () => void;
  disableAll: () => void;
}

export interface UseNotificationFormReturn extends NotificationFormState, NotificationFormActions {}

export interface NotificationGroup {
  id: string;
  title: string;
  description: string;
  settings: Array<{
    key: keyof NotificationSettings;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }>;
} 