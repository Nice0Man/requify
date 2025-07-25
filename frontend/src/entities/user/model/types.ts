/**
 * User Entity Types - Типы сущности пользователей
 * Соответствуют backend API schemas
 */

// =============================================================================
// Основные типы пользователей (соответствуют backend/app/schemas/user.py)
// =============================================================================

export interface UserBase {
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  full_name?: string;
  is_active?: boolean;
  role?: UserRole;
  avatar_url?: string;
}

export interface User extends UserBase {
  id: number;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  email_verified: boolean;
}

// =============================================================================
// Роли и права пользователей
// =============================================================================

export const USER_ROLES = [
  "admin",
  "project_manager",
  "analyst",
  "developer",
  "tester",
  "viewer",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface UserPermission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// =============================================================================
// API Response типы
// =============================================================================

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UserDetailResponse {
  user: User;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  email_verified?: boolean;
  created_from?: string;
  created_to?: string;
  sort_by?: "username" | "email" | "created_at" | "last_login_at";
  sort_order?: "asc" | "desc";
}

// =============================================================================
// Профиль пользователя
// =============================================================================

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  bio?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  theme_preference?: "light" | "dark" | "auto";
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// =============================================================================
// Настройки пользователя
// =============================================================================

export interface UserSettings {
  id: number;
  user_id: number;
  notifications: {
    email_notifications: boolean;
    push_notifications: boolean;
    project_updates: boolean;
    requirement_assignments: boolean;
    mention_notifications: boolean;
    weekly_digest: boolean;
  };
  interface: {
    theme: "light" | "dark" | "auto";
    language: string;
    timezone: string;
    date_format: string;
    time_format: "12h" | "24h";
  };
  privacy: {
    profile_visibility: "public" | "team" | "private";
    show_email: boolean;
    show_phone: boolean;
    activity_visibility: boolean;
  };
}

export interface UserPreferences {
  dashboard_layout: "compact" | "comfortable" | "spacious";
  default_project_view: "grid" | "list" | "kanban";
  items_per_page: number;
  auto_save: boolean;
  quick_actions: string[];
}

// =============================================================================
// Статистика пользователя
// =============================================================================

export interface UserStatistics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_requirements: number;
  completed_requirements: number;
  in_progress_requirements: number;
  overdue_requirements: number;
  average_completion_time: number;
  productivity_score: number;
  activity_this_week: number;
  activity_this_month: number;
}

// =============================================================================
// Активность пользователя
// =============================================================================

export interface UserActivityLog {
  id: number;
  user_id: number;
  action_type:
    | "login"
    | "logout"
    | "create"
    | "update"
    | "delete"
    | "view"
    | "comment";
  resource_type:
    | "project"
    | "requirement"
    | "release"
    | "test_case"
    | "user"
    | "team";
  resource_id?: number;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// Сессии пользователя
// =============================================================================

export interface UserSession {
  id: number;
  user_id: number;
  session_token: string;
  refresh_token?: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  last_accessed_at: string;
}

// =============================================================================
// Уведомления пользователя
// =============================================================================

export interface UserNotification {
  id: number;
  user_id: number;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// Аудит пользователя
// =============================================================================

export interface UserAuditLog {
  id: number;
  user_id: number;
  admin_id: number;
  action:
    | "created"
    | "updated"
    | "activated"
    | "deactivated"
    | "role_changed"
    | "deleted";
  changes: Record<string, { old_value: any; new_value: any }>;
  reason?: string;
  created_at: string;
  admin: {
    id: number;
    username: string;
    full_name?: string;
  };
}

// =============================================================================
// Поиск пользователей
// =============================================================================

export interface UserSearchResult {
  users: Array<{
    id: number;
    username: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: UserRole;
    is_active: boolean;
  }>;
  total: number;
  query: string;
}

// =============================================================================
// Операции с пользователями
// =============================================================================

export interface UserBulkOperation {
  operation: "activate" | "deactivate" | "delete" | "change_role" | "export";
  user_ids: number[];
  parameters?: {
    new_role?: UserRole;
    export_format?: "json" | "csv" | "excel";
    reason?: string;
  };
}

// =============================================================================
// Валидация
// =============================================================================

export interface UserValidationResult {
  is_valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// =============================================================================
// Константы для валидации (соответствуют backend)
// =============================================================================

export const USER_VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_.-]+$/,
  },
  EMAIL: {
    MAX_LENGTH: 255,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  FULL_NAME: {
    MAX_LENGTH: 100,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 255,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: true,
  },
} as const;

// =============================================================================
// Функции-хелперы
// =============================================================================

export const getUserRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    admin: "#f44336",
    project_manager: "#9c27b0",
    analyst: "#3f51b5",
    developer: "#2196f3",
    tester: "#ff9800",
    viewer: "#4caf50",
  };
  return roleColors[role] || "#9e9e9e";
};

export const getUserRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    admin: "Администратор",
    project_manager: "Менеджер проекта",
    analyst: "Аналитик",
    developer: "Разработчик",
    tester: "Тестировщик",
    viewer: "Наблюдатель",
  };
  return roleNames[role] || role;
};

export const canUserPerformAction = (
  userRole: UserRole,
  action: string,
  resource: string
): boolean => {
  // Базовая логика прав доступа - должна быть расширена в соответствии с требованиями
  const permissions: Record<UserRole, string[]> = {
    admin: ["*"],
    project_manager: ["project:*", "requirement:*", "team:*", "user:read"],
    analyst: ["requirement:*", "project:read", "test:read"],
    developer: ["requirement:read", "requirement:update", "project:read"],
    tester: ["test:*", "requirement:read", "project:read"],
    viewer: ["*:read"],
  };

  const userPermissions = permissions[userRole] || [];
  const fullAction = `${resource}:${action}`;

  return (
    userPermissions.includes("*") ||
    userPermissions.includes(fullAction) ||
    userPermissions.includes(`${resource}:*`) ||
    (action === "read" && userPermissions.includes("*:read"))
  );
};
