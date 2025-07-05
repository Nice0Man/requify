import type { UserProfile } from "@/entities/user";

// =============================================================================
// Auth State Types
// =============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: UserProfile | null;
  permissions: string[];
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  sessions: ActiveSession[];
  error: AuthError | null;
  requireEmailVerification: boolean;
  allowRegistration: boolean;
  allowPasswordReset: boolean;
  grant_type: GrantType;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// =============================================================================
// Form Data Types
// =============================================================================

export type GrantType = "password" | "refresh_token";

export interface LoginFormData {
  username: string;
  password: string;
  remember_me: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

export interface PasswordChangeFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordResetFormData {
  email: string;
}

export interface PasswordResetConfirmFormData {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface EmailVerificationFormData {
  email: string;
}

export interface EmailVerificationConfirmFormData {
  token: string;
}

// =============================================================================
// Session Types
// =============================================================================

export interface ActiveSession {
  id: number;
  created_at: string;
  last_used_at?: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
  is_current: boolean;
}

// =============================================================================
// Auth Action Types
// =============================================================================

export type AuthAction =
  | { type: "AUTH_INITIALIZE_START" }
  | {
      type: "AUTH_INITIALIZE_SUCCESS";
      payload: {
        user: UserProfile;
        permissions: string[];
      };
    }
  | { type: "AUTH_INITIALIZE_FAILURE"; payload: AuthError }
  | { type: "AUTH_LOGIN_START" }
  | {
      type: "AUTH_LOGIN_SUCCESS";
      payload: {
        user: UserProfile;
        permissions: string[];
        accessToken: string;
        refreshToken: string;
        tokenExpiry: number;
      };
    }
  | { type: "AUTH_LOGIN_FAILURE"; payload: AuthError }
  | { type: "AUTH_REGISTER_START" }
  | {
      type: "AUTH_REGISTER_SUCCESS";
      payload: {
        user: UserProfile;
        permissions: string[];
        accessToken: string;
        refreshToken: string;
        tokenExpiry: number;
      };
    }
  | { type: "AUTH_REGISTER_FAILURE"; payload: AuthError }
  | { type: "AUTH_LOGOUT_START" }
  | { type: "AUTH_LOGOUT_SUCCESS" }
  | { type: "AUTH_LOGOUT_FAILURE"; payload: AuthError }
  | {
      type: "AUTH_REFRESH_TOKEN_SUCCESS";
      payload: {
        accessToken: string;
        tokenExpiry: number;
      };
    }
  | { type: "AUTH_REFRESH_TOKEN_FAILURE"; payload: AuthError }
  | { type: "AUTH_UPDATE_USER"; payload: UserProfile }
  | { type: "AUTH_UPDATE_PERMISSIONS"; payload: string[] }
  | { type: "AUTH_UPDATE_SESSIONS"; payload: ActiveSession[] }
  | { type: "AUTH_CLEAR_ERROR" }
  | { type: "AUTH_SET_ERROR"; payload: AuthError };

// =============================================================================
// Auth Context Type
// =============================================================================

export interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: UserProfile | null;
  permissions: string[];
  sessions: ActiveSession[];
  error: AuthError | null;
  grant_type: GrantType;
  requireEmailVerification: boolean;
  allowRegistration: boolean;
  allowPasswordReset: boolean;
    
  // Actions
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: (logoutAll?: boolean) => Promise<void>;
  setGrantType: (grantType: GrantType) => void; 
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  changePassword: (data: PasswordChangeFormData) => Promise<void>;
  requestPasswordReset: (data: PasswordResetFormData) => Promise<void>;
  confirmPasswordReset: (data: PasswordResetConfirmFormData) => Promise<void>;
  requestEmailVerification: (data: EmailVerificationFormData) => Promise<void>;
  confirmEmailVerification: (data: EmailVerificationConfirmFormData) => Promise<void>;
  getSessions: () => Promise<void>;
  revokeSessions: (sessionIds?: number[], revokeAll?: boolean) => Promise<void>;
  
  // Utilities
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  checkUsernameAvailability: (username: string) => Promise<{
    available: boolean;
    suggestions?: string[];
  }>;
  checkEmailAvailability: (email: string) => Promise<{
    available: boolean;
    registered: boolean;
  }>;
}

// =============================================================================
// Permission Types
// =============================================================================

export interface PermissionContextType {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  permissions: string[];
  user: UserProfile | null;
}

// =============================================================================
// Auth Hook Types
// =============================================================================

export interface UseAuthReturn extends AuthContextType {}

export interface UsePermissionsReturn extends PermissionContextType {}

// =============================================================================
// Auth Storage Types
// =============================================================================

export interface AuthStorageData {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  user: UserProfile;
  permissions: string[];
}

// =============================================================================
// Validation Types
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface LoginValidation extends ValidationResult {}
export interface RegisterValidation extends ValidationResult {}
export interface PasswordChangeValidation extends ValidationResult {}
export interface PasswordResetValidation extends ValidationResult {}

// =============================================================================
// API Error Types
// =============================================================================

export interface ApiError {
  detail: string;
  status_code?: number;
  error_code?: string;
  validation_errors?: Record<string, string[]>;
}

// =============================================================================
// Auth Constants
// =============================================================================

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "requify_access_token",
  REFRESH_TOKEN: "requify_refresh_token",
  USER: "requify_user",
  PERMISSIONS: "requify_permissions",
  TOKEN_EXPIRY: "requify_token_expiry",
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  REFRESH_TOKEN_EXPIRED: "REFRESH_TOKEN_EXPIRED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  ANALYST: "analyst",
  DEVELOPER: "developer",
  TESTER: "tester",
  VIEWER: "viewer",
  GUEST: "guest",
} as const;

export const PERMISSIONS = {
  // Project permissions
  PROJECT_VIEW: "project:view",
  PROJECT_CREATE: "project:create",
  PROJECT_EDIT: "project:edit",
  PROJECT_DELETE: "project:delete",
  PROJECT_MANAGE: "project:manage",

  // Requirement permissions
  REQUIREMENT_VIEW: "requirement:view",
  REQUIREMENT_CREATE: "requirement:create",
  REQUIREMENT_EDIT: "requirement:edit",
  REQUIREMENT_DELETE: "requirement:delete",
  REQUIREMENT_APPROVE: "requirement:approve",

  // Release permissions
  RELEASE_VIEW: "release:view",
  RELEASE_CREATE: "release:create",
  RELEASE_EDIT: "release:edit",
  RELEASE_DELETE: "release:delete",
  RELEASE_PUBLISH: "release:publish",

  // User permissions
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_EDIT: "user:edit",
  USER_DELETE: "user:delete",
  USER_MANAGE: "user:manage",

  // Admin permissions
  ADMIN_ACCESS: "admin:access",
  ADMIN_SYSTEM: "admin:system",
  ADMIN_LOGS: "admin:logs",
  ADMIN_BACKUP: "admin:backup",

  // Testing permissions
  TEST_VIEW: "test:view",
  TEST_CREATE: "test:create",
  TEST_EXECUTE: "test:execute",
  TEST_MANAGE: "test:manage",

  // Comment permissions
  COMMENT_VIEW: "comment:view",
  COMMENT_CREATE: "comment:create",
  COMMENT_EDIT: "comment:edit",
  COMMENT_DELETE: "comment:delete",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type AuthErrorCode = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];
