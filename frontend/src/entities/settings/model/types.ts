/**
 * Settings Entity Types - Типы сущности настроек
 * Расширяет типы пользователя для настроек
 */

// =============================================================================
// Основные типы настроек
// =============================================================================

export interface UserProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  bio?: string;
  avatar_url?: string;
  timezone?: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  project_updates: boolean;
  requirement_changes: boolean;
  release_notifications: boolean;
  team_invitations: boolean;
  system_notifications: boolean;
  weekly_digest: boolean;
  mention_notifications: boolean;
}

export interface SecuritySettings {
  two_factor_auth: boolean;
  login_notifications: boolean;
  session_timeout: number;
  allow_multiple_sessions: boolean;
  auto_logout: boolean;
}

export interface InterfaceSettings {
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  date_format: string;
  time_format: "12h" | "24h";
  compact_mode: boolean;
  sidebar_collapsed: boolean;
  show_hints: boolean;
  animations_enabled: boolean;
}

export interface PrivacySettings {
  profile_visibility: "public" | "team" | "private";
  show_email: boolean;
  show_phone: boolean;
  activity_visibility: boolean;
}

// =============================================================================
// Объединенный тип настроек
// =============================================================================

export interface UserSettings {
  profile: UserProfileSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  interface: InterfaceSettings;
  privacy: PrivacySettings;
}

// =============================================================================
// API типы для обновления настроек
// =============================================================================

export interface UserSettingsUpdate {
  profile?: Partial<UserProfileSettings>;
  notifications?: Partial<NotificationSettings>;
  security?: Partial<SecuritySettings>;
  interface?: Partial<InterfaceSettings>;
  privacy?: Partial<PrivacySettings>;
}

// =============================================================================
// Типы ответов API
// =============================================================================

export interface SettingsResponse {
  success: boolean;
  message?: string;
  data?: UserSettings;
}

export interface SettingsValidationError {
  field: string;
  message: string;
  code: string;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: SettingsValidationError[];
  warnings: SettingsValidationError[];
}

// =============================================================================
// Константы настроек
// =============================================================================

export const SETTINGS_CONSTANTS = {
  THEME_OPTIONS: [
    { value: "light", label: "Светлая" },
    { value: "dark", label: "Темная" },
    { value: "auto", label: "Системная" },
  ],
  LANGUAGE_OPTIONS: [
    { value: "ru", label: "Русский" },
    { value: "en", label: "English" },
  ],
  TIME_FORMAT_OPTIONS: [
    { value: "12h", label: "12-часовой" },
    { value: "24h", label: "24-часовой" },
  ],
  SESSION_TIMEOUT_OPTIONS: [
    { value: 15, label: "15 минут" },
    { value: 30, label: "30 минут" },
    { value: 60, label: "1 час" },
    { value: 120, label: "2 часа" },
    { value: 480, label: "8 часов" },
  ],
  PROFILE_VISIBILITY_OPTIONS: [
    { value: "public", label: "Публичный" },
    { value: "team", label: "Для команды" },
    { value: "private", label: "Приватный" },
  ],
} as const;

// =============================================================================
// Типы для UI компонентов
// =============================================================================

export interface SettingsTabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

export interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
  color?: string;
}

// =============================================================================
// Хелперы для валидации
// =============================================================================

export const validateProfileSettings = (
  profile: Partial<UserProfileSettings>
): SettingsValidationResult => {
  const errors: SettingsValidationError[] = [];
  const warnings: SettingsValidationError[] = [];

  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    errors.push({
      field: "email",
      message: "Неверный формат email",
      code: "INVALID_EMAIL",
    });
  }

  if (profile.phone && profile.phone.length < 10) {
    warnings.push({
      field: "phone",
      message: "Слишком короткий номер телефона",
      code: "SHORT_PHONE",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
