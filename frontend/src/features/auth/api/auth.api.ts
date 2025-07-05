import { apiClient } from "@/shared/api/client";
import type { UserProfile, UserCreate } from "@/entities/user";
import type { ApiResponse } from "@/shared/types/api";

// =============================================================================
// Auth Request/res Types
// =============================================================================

export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest extends UserCreate {
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: UserProfile;
  permissions: string[];
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

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirm {
  token: string;
}

export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  ip_address: string;
  location?: string;
  created_at: string;
  last_activity: string;
  is_current: boolean;
}

// =============================================================================
// Auth API Class
// =============================================================================

export class AuthApi {
  private readonly baseUrl = "/auth";

  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient
      .post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .then((res) => res.data);
  }

  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiClient
      .post<AuthResponse>(`${this.baseUrl}/register`, userData)
      .then((res) => res.data);
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    return apiClient
      .post<void>(`${this.baseUrl}/logout`)
      .then((res) => res.data);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    return apiClient
      .post<{
        access_token: string;
        expires_in: number;
      }>(`${this.baseUrl}/refresh`, { refresh_token: refreshToken })
      .then((res) => res.data);
  }

  /**
   * Validate current token
   */
  async validateToken(): Promise<{
    valid: boolean;
    user?: UserProfile;
    expires_at?: string;
  }> {
    return apiClient
      .post<{
        valid: boolean;
        user?: UserProfile;
        expires_at?: string;
      }>(`${this.baseUrl}/validate-token`)
      .then((res) => res.data);
  }

  /**
   * Change user password
   */
  async changePassword(
    request: PasswordChangeRequest
  ): Promise<ApiResponse<void>> {
    return apiClient
      .post<ApiResponse<void>>(`${this.baseUrl}/change-password`, request)
      .then((res) => res.data);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<
    ApiResponse<{
      message: string;
      reset_token_expires_in: number;
    }>
  > {
    return apiClient
      .post<
        ApiResponse<{
          message: string;
          reset_token_expires_in: number;
        }>
      >(`${this.baseUrl}/reset-password`, request)
      .then((res) => res.data);
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(request: PasswordResetConfirm): Promise<
    ApiResponse<{
      message: string;
    }>
  > {
    return apiClient
      .post<
        ApiResponse<{
          message: string;
        }>
      >(`${this.baseUrl}/reset-password/confirm`, request)
      .then((res) => res.data);
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(request: EmailVerificationRequest): Promise<
    ApiResponse<{
      message: string;
      verification_token_expires_in: number;
    }>
  > {
    return apiClient
      .post<
        ApiResponse<{
          message: string;
          verification_token_expires_in: number;
        }>
      >(`${this.baseUrl}/verify-email/request`, request)
      .then((res) => res.data);
  }

  /**
   * Confirm email verification
   */
  async confirmEmailVerification(request: EmailVerificationConfirm): Promise<
    ApiResponse<{
      message: string;
    }>
  > {
    return apiClient
      .post<
        ApiResponse<{
          message: string;
        }>
      >(`${this.baseUrl}/verify-email/confirm`, request)
      .then((res) => res.data);
  }

  /**
   * Get user sessions
   */
  async getUserSessions(): Promise<SessionInfo[]> {
    return apiClient
      .get<SessionInfo[]>(`${this.baseUrl}/sessions`)
      .then((res) => res.data);
  }

  /**
   * Revoke specific sessions
   */
  async revokeSessions(sessionIds: string[]): Promise<
    ApiResponse<{
      revoked_sessions: number;
      failed_sessions: string[];
    }>
  > {
    return apiClient
      .post<
        ApiResponse<{
          revoked_sessions: number;
          failed_sessions: string[];
        }>
      >(`${this.baseUrl}/sessions/revoke`, { session_ids: sessionIds })
      .then((res) => res.data);
  }

  /**
   * Revoke all other sessions except current
   */
  async revokeAllOtherSessions(): Promise<
    ApiResponse<{
      revoked_sessions: number;
    }>
  > {
    return apiClient
      .post<
        ApiResponse<{
          revoked_sessions: number;
        }>
      >(`${this.baseUrl}/sessions/revoke-others`)
      .then((res) => res.data);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    return apiClient
      .get<UserProfile>("/api/v1/users/me")
      .then((res) => res.data);
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(userData: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient
      .put<UserProfile>('/api/v1/users/me', userData)
      .then((res) => res.data);
  }

  /**
   * Get user by ID
   */
  async getUser(userId: number): Promise<UserProfile> {
    return apiClient
      .get<UserProfile>(`/api/v1/users/${userId}`)
      .then((res) => res.data);
  }

  /**
   * Get users list
   */
  async getUsers(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<{ items: UserProfile[]; total: number }> {
    return apiClient
      .get<{ items: UserProfile[]; total: number }>('/api/v1/users/', { params })
      .then((res) => res.data);
  }

  /**
   * Check if username is available
   */
  async checkUsernameAvailability(username: string): Promise<{
    available: boolean;
    suggestions?: string[];
  }> {
    return apiClient
      .get<{
        available: boolean;
        suggestions?: string[];
      }>(
        `${this.baseUrl}/check-username?username=${encodeURIComponent(
          username
        )}`
      )
      .then((res) => res.data);
  }

  /**
   * Check if email is available
   */
  async checkEmailAvailability(email: string): Promise<{
    available: boolean;
    registered: boolean;
  }> {
    return apiClient
      .get<{
        available: boolean;
        registered: boolean;
      }>(`${this.baseUrl}/check-email?email=${encodeURIComponent(email)}`)
      .then((res) => res.data);
  }
}

// Экспорт экземпляра API
export const authApi = new AuthApi();

// Создаем алиас для пользовательских операций
export const usersApi = {
  getCurrentUser: () => authApi.getCurrentUser(),
  updateCurrentUser: (userData: Partial<UserProfile>) => authApi.updateCurrentUser(userData),
  getUser: (userId: number) => authApi.getUser(userId),
  getUsers: (params?: { skip?: number; limit?: number; search?: string; role?: string }) => authApi.getUsers(params),
};
