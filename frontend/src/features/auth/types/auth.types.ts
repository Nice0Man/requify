// Authentication types based on backend contracts

export interface User {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_active: boolean;
  is_superuser: boolean;
  permissions: string[];
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  name: string | undefined;
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_active: boolean;
  department?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  avatar?: string;
  notification_preferences: NotificationPreferences;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  department?: string;
  phone?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  grant_type?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
  permissions: string[];
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface LogoutResponse {
  message: string;
  revoked_tokens: number;
}

export interface TokenValidationRequest {
  token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  user?: UserProfile;
  expires_at?: string;
  scopes?: string[];
}

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
  total_count: number;
  current_session_id: number;
}

export interface RevokeSessionRequest {
  session_id: number;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ANALYST = 'analyst',
  TESTER = 'tester',
  USER = 'user'
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  requirement_updates: boolean;
  test_results: boolean;
  system_alerts: boolean;
}

export interface AuthError {
  error: string;
  error_description: string;
  error_details?: Record<string, any>;
}

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  permissions: string[];
  sessions: ActiveSession[];
} 