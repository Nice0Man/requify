/**
 * OAuth2 Authentication Types
 * Основано на схемах из backend/app/schemas/auth.py
 */

// === Base Token Types ===

export interface TokenBase {
  token_type: string;
}

export interface AccessToken extends TokenBase {
  access_token: string;
  expires_in: number;
}

export interface RefreshToken extends TokenBase {
  refresh_token: string;
  expires_in: number;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
}

// === JWT Payload Types ===

export interface AccessTokenPayload {
  sub: string; // Subject (user email)
  exp: number; // Expiration time (timestamp)
  iat: number; // Issued at (timestamp)
  type: string; // Token type
  user_id: number;
  scopes: string[];
}

export interface RefreshTokenPayload {
  sub: string; // Subject (user email)
  exp: number; // Expiration time (timestamp)
  iat: number; // Issued at (timestamp)
  type: string; // Token type
  user_id: number;
  token_id: string; // ID refresh токена в БД
}

export interface TokenData {
  email?: string;
  user_id?: number;
  scopes: string[];
}

// === Authentication Request/Response Types ===

export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  name?: string;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
  email_verified: boolean;
  email_verified_at?: string;
  last_login?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  user: UserProfile;
  permissions: string[];
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in?: number;
}

export interface LogoutRequest {
  refresh_token?: string;
  logout_all?: boolean;
}

export interface LogoutResponse {
  message: string;
  revoked_tokens: number;
}

// === Password Management Types ===

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

// === Token Validation Types ===

export interface TokenValidationRequest {
  token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  expires_at?: string;
  user?: UserProfile;
}

// === Session Management Types ===

export interface ActiveSession {
  id: number;
  created_at: string;
  last_used_at?: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
  is_current: boolean;
}

export interface SessionListResponse {
  sessions: ActiveSession[];
  total: number;
}

export interface RevokeSessionRequest {
  session_id?: number;
  revoke_all?: boolean;
}

// === Authentication Error Types ===

export interface AuthError {
  error: string;
  error_description: string;
  error_details?: Record<string, unknown>;
}

// === Email Verification Types ===

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirm {
  token: string;
}

export interface EmailVerificationResponse {
  message: string;
  verified: boolean;
}

// === OAuth2 Flow Types ===

export interface OAuth2State {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user?: UserProfile;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  permissions: string[];
  error?: string;
}

export interface OAuth2Actions {
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: (request?: LogoutRequest) => Promise<void>;
  refreshTokens: () => Promise<RefreshTokenResponse>;
  clearError: () => void;
  validateToken: (token: string) => Promise<TokenValidationResponse>;
  changePassword: (request: PasswordChangeRequest) => Promise<void>;
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (request: PasswordResetConfirm) => Promise<void>;
  requestEmailVerification: (request: EmailVerificationRequest) => Promise<void>;
  confirmEmailVerification: (request: EmailVerificationConfirm) => Promise<EmailVerificationResponse>;
  getSessions: () => Promise<SessionListResponse>;
  revokeSession: (request: RevokeSessionRequest) => Promise<void>;
}

// === User Roles & Permissions ===

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ANALYST = 'analyst',
  DEVELOPER = 'developer',
  TESTER = 'tester',
  VIEWER = 'viewer',
  GUEST = 'guest',
}

export enum Permission {
  // User permissions
  USERS_VIEW = 'users:view',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  
  // Project permissions
  PROJECTS_VIEW = 'projects:view',
  PROJECTS_CREATE = 'projects:create',
  PROJECTS_UPDATE = 'projects:update',
  PROJECTS_DELETE = 'projects:delete',
  
  // Requirement permissions
  REQUIREMENTS_VIEW = 'requirements:view',
  REQUIREMENTS_CREATE = 'requirements:create',
  REQUIREMENTS_UPDATE = 'requirements:update',
  REQUIREMENTS_DELETE = 'requirements:delete',
  
  // Admin permissions
  ADMIN_PANEL = 'admin:panel',
  SYSTEM_SETTINGS = 'system:settings',
}

// === Utility Types ===

export type AuthenticatedUser = Required<Pick<OAuth2State, 'user' | 'accessToken'>>;

export interface AuthContextType extends OAuth2State, OAuth2Actions {}

// === Form Validation Types ===

export interface LoginFormData {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  phone?: string;
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