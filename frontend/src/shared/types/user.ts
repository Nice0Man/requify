/**
 * User Types
 * Основано на схемах из backend/app/schemas/user.py
 */

// === Base User Types ===

export interface UserBase {
  username: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  phone?: string;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  role?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  phone?: string;
}

export interface UserInDBBase extends UserBase {
  id: number;
  created_at: string;
  email_verified: boolean;
  email_verified_at?: string;
}

export interface User extends UserInDBBase {}

export interface UserWithStats extends User {
  authored_requirements_count: number;
  modified_requirements_count: number;
  comments_count: number;
  total_activity: number;
  is_active_contributor: boolean;
}

export interface UserInDB extends UserInDBBase {
  hashed_password: string;
}

// === Authentication Related User Types ===

export interface UserLogin {
  username: string; // может быть username или email
  password: string;
}

export interface UserProfile {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  role: string;
  created_at: string;
  display_name: string;
}

// === Password Management Types ===

export interface UserPasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserPasswordReset {
  email: string;
}

export interface UserPasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

// === Email Verification Types ===

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirm {
  token: string;
}

// === User Roles Enum ===

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ANALYST = 'analyst',
  DEVELOPER = 'developer',
  TESTER = 'tester',
  VIEWER = 'viewer',
  GUEST = 'guest',
}

// === User Status Types ===

export interface UserStatus {
  is_active: boolean;
  is_superuser: boolean;
  email_verified: boolean;
  last_login?: string;
}

export interface FullUser extends UserInDBBase, UserStatus {
  permissions: string[];
}

// === Form Data Types ===

export interface UserRegistrationFormData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  phone?: string;
  role: UserRole;
}

export interface UserEditFormData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  phone?: string;
  role?: UserRole;
}

export interface UserPasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// === API Response Types ===

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface UserDetailResponse extends User {
  permissions: string[];
  last_login?: string;
  is_superuser: boolean;
}

export interface UserActivityResponse {
  user_id: number;
  authored_requirements: number;
  modified_requirements: number;
  comments: number;
  total_activity: number;
  last_activity?: string;
}

// === User Filter & Search Types ===

export interface UserFilter {
  role?: UserRole;
  department?: string;
  is_active?: boolean;
  email_verified?: boolean;
  search?: string;
}

export interface UserSortOptions {
  field: 'username' | 'email' | 'role' | 'created_at' | 'last_login';
  direction: 'asc' | 'desc';
}

export interface UserQueryParams extends UserFilter {
  page?: number;
  per_page?: number;
  sort?: UserSortOptions;
}

// === User Management Types ===

export interface UserBulkOperation {
  user_ids: number[];
  operation: 'activate' | 'deactivate' | 'delete' | 'change_role';
  data?: {
    role?: UserRole;
  };
}

export interface UserImportData {
  users: UserCreate[];
  send_welcome_email?: boolean;
  force_password_change?: boolean;
}

export interface UserExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  fields: string[];
  filter?: UserFilter;
}

// === User Validation Types ===

export interface UserValidationError {
  field: string;
  message: string;
  code: string;
}

export interface UserValidationResult {
  valid: boolean;
  errors: UserValidationError[];
}

// === User Audit Types ===

export interface UserAuditLog {
  id: number;
  user_id: number;
  action: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  performed_by: number;
}

export interface UserAuditListResponse {
  logs: UserAuditLog[];
  total: number;
  page: number;
  per_page: number;
}

// === Utility Types ===

export type UserPublicInfo = Pick<User, 'id' | 'username' | 'first_name' | 'last_name' | 'department' | 'role'>;

export type UserMinimalInfo = Pick<User, 'id' | 'username' | 'email'>;

export type UserContactInfo = Pick<User, 'email' | 'phone' | 'first_name' | 'last_name'>;

// === User Preferences Types ===

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'ru' | 'en';
  timezone: string;
  notifications: {
    email: boolean;
    browser: boolean;
    mentions: boolean;
    comments: boolean;
    status_changes: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
    refresh_interval: number;
  };
}

export interface UserSettings extends UserPreferences {
  user_id: number;
  created_at: string;
  updated_at: string;
} 