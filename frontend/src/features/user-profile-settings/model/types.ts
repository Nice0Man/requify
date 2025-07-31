/**
 * User Profile Settings Feature Types
 */

import type {
  UserProfileSettings,
  SettingsResponse,
} from "@/entities/user-settings";

export interface ProfileFormData extends UserProfileSettings {
  // Дополнительные поля для формы
  _isEditing?: boolean;
  _hasChanges?: boolean;
}

export interface ProfileUpdatePayload {
  settings: Partial<UserProfileSettings>;
  avatar?: File;
}

export interface ProfileFormState {
  data: ProfileFormData;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  isValid: boolean;
  isDirty: boolean;
}

export interface ProfileFormActions {
  updateField: (field: keyof UserProfileSettings, value: string) => void;
  uploadAvatar: (file: File) => Promise<void>;
  saveProfile: () => Promise<SettingsResponse>;
  resetForm: () => void;
  validateForm: () => boolean;
}

export interface UseProfileFormReturn
  extends ProfileFormState,
    ProfileFormActions {}
