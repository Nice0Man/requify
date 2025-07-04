// User entity types - используют контракты из shared/api
// В соответствии с принципами FSD, entities используют типы из shared

import type {
  User as UserSchema,
  UserCreate as UserCreateSchema,
  UserUpdate as UserUpdateSchema,
  UserWithStats as UserWithStatsSchema,
  UserBase as UserBaseSchema,
  UserRegistration as UserRegistrationSchema,
  UserProfile as UserProfileSchema,
  UserPreferences as UserPreferencesSchema,
  UserSession as UserSessionSchema,
  UserSettings as UserSettingsSchema,
  UserRole,
  UserStatus,
} from '@/shared/api/types';

// =============================================================================
// Re-export API types for entity usage
// =============================================================================

export type UserBase = UserBaseSchema;
export type User = UserSchema;
export type UserCreate = UserCreateSchema;
export type UserUpdate = UserUpdateSchema;
export type UserWithStats = UserWithStatsSchema;
export type UserRegistration = UserRegistrationSchema;
export type UserProfile = UserProfileSchema;
export type UserPreferences = UserPreferencesSchema;
export type UserSession = UserSessionSchema;
export type UserSettings = UserSettingsSchema;

// =============================================================================
// User Role and Status Types (re-export from API)
// =============================================================================

export type { UserRole, UserStatus };

export const USER_ROLES: Record<UserRole, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  analyst: 'Аналитик',
  developer: 'Разработчик',
  tester: 'Тестировщик',
  client: 'Клиент',
  viewer: 'Наблюдатель',
};

export const USER_STATUSES: Record<UserStatus, string> = {
  active: 'Активный',
  inactive: 'Неактивный',
  pending: 'Ожидает подтверждения',
  suspended: 'Заблокирован',
  deleted: 'Удален',
};

// =============================================================================
// Extended UI Types (не в API, только для UI)
// =============================================================================

export interface UserWithDetails extends UserWithStats {
  full_name?: string;
  projects_managed?: number;
  projects_participating?: number;
  requirements_created?: number;
  requirements_assigned?: number;
  last_login?: string;
  timezone?: string;
  language?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    in_app: boolean;
    types: string[];
  };
  avatar_url?: string;
  bio?: string;
  social_links?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

// =============================================================================
// UI State Types
// =============================================================================

export interface UserState {
  users: User[];
  currentUser: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  per_page: number;
}

export interface UserFilters {
  search?: string;
  role?: UserRole[];
  status?: UserStatus[];
  department?: string[];
  created_from?: string;
  created_to?: string;
  last_login_from?: string;
  last_login_to?: string;
  project_id?: number;
  skills?: string[];
}

// =============================================================================
// User Permissions (UI specific)
// =============================================================================

export interface UserPermissions {
  can_create_projects: boolean;
  can_manage_users: boolean;
  can_view_reports: boolean;
  can_export_data: boolean;
  can_access_admin: boolean;
  can_manage_system: boolean;
  can_create_requirements: boolean;
  can_approve_requirements: boolean;
  can_manage_releases: boolean;
  can_run_tests: boolean;
  can_view_analytics: boolean;
  projects_accessible: number[];
  projects_manageable: number[];
}

// =============================================================================
// Team Management (UI specific)
// =============================================================================

export interface TeamMember extends User {
  team_role?: string;
  team_permissions?: string[];
  joined_at?: string;
  performance_score?: number;
  workload?: 'low' | 'medium' | 'high' | 'overloaded';
  current_projects?: Array<{
    id: number;
    name: string;
    role: string;
  }>;
}

export interface UserActivity {
  user_id: number;
  action: string;
  resource_type: string;
  resource_id: number;
  resource_title?: string;
  timestamp: string;
  details?: Record<string, any>;
}

// =============================================================================
// UI Helper Functions
// =============================================================================

export const getUserFullName = (user: User): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.first_name || user.last_name || user.email || 'Неизвестный пользователь';
};

export const getUserInitials = (user: User): string => {
  const firstName = user.first_name?.charAt(0).toUpperCase() || '';
  const lastName = user.last_name?.charAt(0).toUpperCase() || '';
  
  if (firstName && lastName) {
    return firstName + lastName;
  }
  
  if (firstName) return firstName;
  if (lastName) return lastName;
  
  return user.email?.charAt(0).toUpperCase() || 'U';
};

export const getUserStatusColor = (status: UserStatus): string => {
  switch (status) {
    case 'active': return '#52c41a';
    case 'inactive': return '#8c8c8c';
    case 'pending': return '#fadb14';
    case 'suspended': return '#ff4d4f';
    case 'deleted': return '#f5222d';
    default: return '#d9d9d9';
  }
};

export const getUserRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'admin': return '#722ed1';
    case 'manager': return '#13c2c2';
    case 'analyst': return '#1890ff';
    case 'developer': return '#52c41a';
    case 'tester': return '#fa8c16';
    case 'client': return '#eb2f96';
    case 'viewer': return '#8c8c8c';
    default: return '#d9d9d9';
  }
};

export const isUserActive = (user: User): boolean => {
  return user.status === 'active' && user.is_active;
};

export const canUserAccessProject = (user: User, projectId: number, permissions?: UserPermissions): boolean => {
  if (user.role === 'admin') return true;
  if (!permissions) return false;
  return permissions.projects_accessible.includes(projectId);
};

export const canUserManageProject = (user: User, projectId: number, permissions?: UserPermissions): boolean => {
  if (user.role === 'admin') return true;
  if (!permissions) return false;
  return permissions.projects_manageable.includes(projectId);
};

export const getUserWorkloadColor = (workload?: 'low' | 'medium' | 'high' | 'overloaded'): string => {
  switch (workload) {
    case 'low': return '#52c41a';
    case 'medium': return '#fadb14';
    case 'high': return '#fa8c16';
    case 'overloaded': return '#ff4d4f';
    default: return '#d9d9d9';
  }
};

export const formatLastLogin = (lastLogin?: string): string => {
  if (!lastLogin) return 'Никогда';
  
  const date = new Date(lastLogin);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffDays > 7) {
    return date.toLocaleDateString('ru-RU');
  } else if (diffDays > 0) {
    return `${diffDays} дн. назад`;
  } else if (diffHours > 0) {
    return `${diffHours} ч. назад`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} мин. назад`;
  } else {
    return 'Только что';
  }
}; 