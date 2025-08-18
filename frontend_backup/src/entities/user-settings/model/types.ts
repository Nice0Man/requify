/**
 * Settings Entity Types - Типы сущности настроек
 * Соответствуют схемам в backend/app/schemas/settings.py
 */

// =============================================================================
// Основные типы настроек
// =============================================================================

export interface UserProfileSettings {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  position?: string;
  bio?: string;
  avatar_url?: string;
  timezone: string;
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
  comment_notifications: boolean;
  deadline_reminders: boolean;
  status_change_notifications: boolean;
  notification_sound: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface SecuritySettings {
  two_factor_auth: boolean;
  login_notifications: boolean;
  session_timeout: number;
  allow_multiple_sessions: boolean;
  auto_logout: boolean;
  password_change_required: boolean;
  login_attempts_limit: number;
  account_lockout_duration: number;
  trusted_devices: string[];
  backup_codes: string[];
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
  items_per_page: number;
  default_view: "list" | "grid" | "kanban";
  auto_save: boolean;
  keyboard_shortcuts: boolean;
}

export interface PrivacySettings {
  profile_visibility: "public" | "team" | "private";
  show_email: boolean;
  show_phone: boolean;
  activity_visibility: boolean;
  search_visibility: boolean;
  data_export_allowed: boolean;
  analytics_enabled: boolean;
  cookies_accepted: boolean;
  marketing_emails: boolean;
}

export interface AdminSettings {
  can_manage_users: boolean;
  can_manage_projects: boolean;
  can_view_audit_logs: boolean;
  can_manage_system_settings: boolean;
  can_export_data: boolean;
  can_manage_backups: boolean;
  notification_level: "all" | "critical" | "none";
  session_management: boolean;
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
  admin?: AdminSettings;
  created_at?: string;
  updated_at?: string;
  version?: number;
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
  admin?: Partial<AdminSettings>;
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
// Типы для работы с сессиями
// =============================================================================

export interface UserSession {
  id: string;
  device_info: string;
  ip_address: string;
  location?: string;
  last_activity: string;
  created_at: string;
  is_current: boolean;
}

export interface SessionsResponse {
  sessions: UserSession[];
  total_count: number;
}

// =============================================================================
// Типы для экспорта/импорта настроек
// =============================================================================

export interface SettingsExport {
  user_id: string;
  export_date: string;
  settings: UserSettings;
  metadata: {
    version: string;
    format: string;
  };
}

export interface SettingsImport {
  settings: Partial<UserSettings>;
  overwrite_existing: boolean;
  import_options: {
    include_profile: boolean;
    include_notifications: boolean;
    include_security: boolean;
    include_interface: boolean;
    include_privacy: boolean;
  };
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
  DEFAULT_VIEW_OPTIONS: [
    { value: "list", label: "Список" },
    { value: "grid", label: "Сетка" },
    { value: "kanban", label: "Канбан" },
  ],
  ITEMS_PER_PAGE_OPTIONS: [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ],
  NOTIFICATION_LEVEL_OPTIONS: [
    { value: "all", label: "Все уведомления" },
    { value: "critical", label: "Только критические" },
    { value: "none", label: "Отключены" },
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

  if (profile.firstName && profile.firstName.length > 50) {
    errors.push({
      field: "firstName",
      message: "Имя не должно превышать 50 символов",
      code: "FIRST_NAME_TOO_LONG",
    });
  }

  if (profile.lastName && profile.lastName.length > 50) {
    errors.push({
      field: "lastName",
      message: "Фамилия не должна превышать 50 символов",
      code: "LAST_NAME_TOO_LONG",
    });
  }

  if (profile.position && profile.position.length > 100) {
    errors.push({
      field: "position",
      message: "Должность не должна превышать 100 символов",
      code: "POSITION_TOO_LONG",
    });
  }

  if (profile.bio && profile.bio.length > 500) {
    errors.push({
      field: "bio",
      message: "Описание не должно превышать 500 символов",
      code: "BIO_TOO_LONG",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
