// User entity types - use contracts from shared/api
// According to FSD principles, entities use types from shared

import {
  UserRole,
  UserStatus,
  UserBase,
  User,
  UserCreate,
  UserUpdate,
  UserWithStats,
  UserRegistration,
  UserProfile,
  UserPreferences,
  UserSession,
  UserSettings,
  USER_ROLES,
  USER_STATUSES
} from '@/shared/api/user.api';

// =============================================================================
// Re-export API types for entity usage
// =============================================================================

export type { UserBase, User, UserCreate, UserUpdate, UserWithStats, UserRegistration, UserProfile, UserPreferences, UserSession, UserSettings };

export type UserBaseSchema = UserBase;
export type UserSchema = User;
export type UserCreateSchema = UserCreate;
export type UserUpdateSchema = UserUpdate;
export type UserWithStatsSchema = UserWithStats;
export type UserRegistrationSchema = UserRegistration;
export type UserProfileSchema = UserProfile;
export type UserPreferencesSchema = UserPreferences;
export type UserSessionSchema = UserSession;
export type UserSettingsSchema = UserSettings;

// =============================================================================
// User Role and Status Types (re-export from API)
// =============================================================================

export { USER_ROLES, USER_STATUSES };
export type { UserRole, UserStatus };

// =============================================================================
// Extended UI Types (not in API, UI only)
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
  return user.first_name || user.last_name || user.email || 'Unknown User';
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


const statusColorMap = new Map<UserStatus, string>([
  [USER_STATUSES.ACTIVE as unknown as UserStatus, '#52c41a'],
  [USER_STATUSES.INACTIVE as unknown as UserStatus, '#8c8c8c'],
  [USER_STATUSES.PENDING as unknown as UserStatus, '#fadb14'],
  [USER_STATUSES.SUSPENDED as unknown as UserStatus, '#ff4d4f'],
  [USER_STATUSES.DELETED as unknown as UserStatus, '#f5222d']
]);

const roleColorMap = new Map<UserRole, string>([
  [USER_ROLES.ADMIN as unknown as UserRole, '#722ed1'],
  [USER_ROLES.MANAGER as unknown as UserRole, '#13c2c2'],
  [USER_ROLES.ANALYST as unknown as UserRole, '#1890ff'],
  [USER_ROLES.DEVELOPER as unknown as UserRole, '#52c41a'],
  [USER_ROLES.TESTER as unknown as UserRole, '#fa8c16'],
  [USER_ROLES.CLIENT as unknown as UserRole, '#eb2f96'],
  [USER_ROLES.VIEWER as unknown as UserRole, '#8c8c8c']
]);

const workloadColorMap = new Map<'low' | 'medium' | 'high' | 'overloaded', string>([
  ['low', '#52c41a'],
  ['medium', '#fadb14'],
  ['high', '#fa8c16'],
  ['overloaded', '#ff4d4f']
]);

export const getUserStatusColor = (status: UserStatus): string => {
  return statusColorMap.get(status) || '#d9d9d9';
};

export const getUserRoleColor = (role: UserRole): string => {
  return roleColorMap.get(role) || '#d9d9d9';
};

export const isUserActive = (user: User): boolean => {
  return user.status === (USER_STATUSES.ACTIVE as unknown as UserStatus) && user.is_active;
};

export const canUserAccessProject = (user: User, projectId: number, permissions?: UserPermissions): boolean => {
  if (user.role === (USER_ROLES.ADMIN as unknown as UserRole)) return true;
  if (!permissions) return false;
  return permissions.projects_accessible.includes(projectId);
};

export const canUserManageProject = (user: User, projectId: number, permissions?: UserPermissions): boolean => {
  if (user.role === (USER_ROLES.ADMIN as unknown as UserRole)) return true;
  if (!permissions) return false;
  return permissions.projects_manageable.includes(projectId);
};

export const getUserWorkloadColor = (workload?: 'low' | 'medium' | 'high' | 'overloaded'): string => {
  if (!workload) return '#d9d9d9';
  return workloadColorMap.get(workload) || '#d9d9d9';
};

export const formatLastLogin = (lastLogin?: string): string => {
  if (!lastLogin) return 'Never';
  
  const date = new Date(lastLogin);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffDays > 7) {
    return date.toLocaleDateString('en-US');
  } else if (diffDays > 0) {
    return `${diffDays} days ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hours ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minutes ago`;
  } else {
    return 'Just now';
  }
}; 