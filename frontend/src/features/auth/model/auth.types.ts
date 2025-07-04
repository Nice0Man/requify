import type { UserProfile } from "@/entities/user";
import type { SessionInfo } from "../api/auth.api";

// =============================================================================
// Auth State Types
// =============================================================================

export interface AuthState {
  // Authentication status
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // User data
  user: UserProfile | null;
  permissions: string[];

  // Token management
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: Date | null;

  // Session management
  sessions: SessionInfo[];

  // Error handling
  error: AuthError | null;

  // Feature flags
  requireEmailVerification: boolean;
  allowRegistration: boolean;
  allowPasswordReset: boolean;
}

export interface AuthError {
  type:
    | "validation"
    | "authentication"
    | "authorization"
    | "network"
    | "server";
  message: string;
  field?: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ValidationErrors {
  [field: string]: string;
}

// =============================================================================
// Auth Actions
// =============================================================================

export type AuthAction =
  | { type: "AUTH_INITIALIZE_START" }
  | {
      type: "AUTH_INITIALIZE_SUCCESS";
      payload: { user: UserProfile; permissions: string[] };
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
        tokenExpiry: Date;
      };
    }
  | { type: "AUTH_LOGIN_FAILURE"; payload: AuthError }
  | { type: "AUTH_LOGOUT_START" }
  | { type: "AUTH_LOGOUT_SUCCESS" }
  | { type: "AUTH_LOGOUT_FAILURE"; payload: AuthError }
  | { type: "AUTH_REGISTER_START" }
  | {
      type: "AUTH_REGISTER_SUCCESS";
      payload: {
        user: UserProfile;
        permissions: string[];
        accessToken: string;
        refreshToken: string;
        tokenExpiry: Date;
      };
    }
  | { type: "AUTH_REGISTER_FAILURE"; payload: AuthError }
  | { type: "AUTH_REFRESH_TOKEN_START" }
  | {
      type: "AUTH_REFRESH_TOKEN_SUCCESS";
      payload: { accessToken: string; tokenExpiry: Date };
    }
  | { type: "AUTH_REFRESH_TOKEN_FAILURE"; payload: AuthError }
  | { type: "AUTH_UPDATE_USER"; payload: UserProfile }
  | { type: "AUTH_UPDATE_PERMISSIONS"; payload: string[] }
  | { type: "AUTH_UPDATE_SESSIONS"; payload: SessionInfo[] }
  | { type: "AUTH_CLEAR_ERROR" }
  | { type: "AUTH_SET_ERROR"; payload: AuthError };

// =============================================================================
// Auth Context Type
// =============================================================================

export interface AuthContextType {
  // Auth state properties
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  permissions: string[];
  sessions: SessionInfo[];
  accessToken: string | null;
  tokenExpiry: Date | null;

  // Authentication methods 
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;

  // Password management
  changePassword: (request: PasswordChangeFormData) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (data: PasswordResetFormData) => Promise<void>;

  // Email verification
  requestEmailVerification: (email: string) => Promise<void>;
  confirmEmailVerification: (token: string) => Promise<void>;

  // Session management
  refreshUserSessions: () => Promise<void>;
  revokeSessions: (sessionIds: string[]) => Promise<void>;
  revokeAllOtherSessions: () => Promise<void>;

  // Profile management
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserData: () => Promise<void>;

  // Utility methods
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshToken: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
  updatePermissions: (permissions: string[]) => void;
  setError: (error: AuthError) => void;
}

// =============================================================================
// Form Data Types
// =============================================================================

export interface LoginFormData {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  marketing_accepted?: boolean;
}

export interface PasswordChangeFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordResetFormData {
  token: string;
  new_password: string;
  confirm_password: string;
}

// =============================================================================
// Token Management
// =============================================================================

export interface TokenManager {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ) => void;
  clearTokens: () => void;
  isTokenExpired: () => boolean;
  getTokenExpiry: () => Date | null;
  refreshAccessToken: () => Promise<string | null>;
  scheduleTokenRefresh: () => void;
  cancelTokenRefresh: () => void;
}

// =============================================================================
// Auth Guards and Routing
// =============================================================================

export interface AuthGuardConfig {
  requireAuth?: boolean;
  requirePermissions?: string[];
  requireAllPermissions?: boolean;
  redirectTo?: string;
  allowUnverifiedEmail?: boolean;
}

export interface AuthRedirectConfig {
  loginRedirect?: string;
  logoutRedirect?: string;
  registerRedirect?: string;
  defaultRedirect?: string;
}
