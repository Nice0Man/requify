// Settings Entity - FSD compliant exports

// Types
export type {
  UserSettings,
  UserSettingsUpdate,
  UserProfileSettings,
  NotificationSettings,
  SecuritySettings,
  InterfaceSettings,
  PrivacySettings,
  SettingsResponse,
  SettingsValidationError,
  SettingsValidationResult,
  SettingsTabItem,
  SettingItemProps,
} from "./model";

// Constants
export { SETTINGS_CONSTANTS, validateProfileSettings } from "./model";

// API
export { settingsDAO, SettingsDAO } from "./api/settingsDAO";
