import { apiClient } from "@/shared/api/client";
import type { UserProfile } from "@/entities/user";
import type { ApiResponse } from "@/shared/types/api";

// =============================================================================
// Auth Request/Response Types (matching backend schemas)
// =============================================================================

export interface LoginRequest {
  username: string;
  password: string;
  remember_me: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
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
  logout_all: boolean;
}

export interface LogoutResponse {
  message: string;
  revoked_tokens: number;
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

export interface TokenValidationRequest {
  token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  expires_at?: string;
  user?: UserProfile;
}

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
  revoke_all: boolean;
}

// =============================================================================
// Auth API Class
// =============================================================================

export class AuthApi {
  private readonly baseUrl = "/auth";

  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        `${this.baseUrl}/login`,
        credentials
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  }

  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        `${this.baseUrl}/register`,
        userData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Registration failed");
    }
  }

  /**
   * User logout
   */
  async logout(request?: LogoutRequest): Promise<LogoutResponse> {
    try {
      const response = await apiClient.post<LogoutResponse>(
        `${this.baseUrl}/logout`,
        request || { logout_all: false }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Logout failed");
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await apiClient.post<RefreshTokenResponse>(
        `${this.baseUrl}/refresh`,
        { refresh_token: refreshToken }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Token refresh failed");
    }
  }

  /**
   * Validate current token
   */
  async validateToken(token?: string): Promise<TokenValidationResponse> {
    try {
      const response = await apiClient.post<TokenValidationResponse>(
        `${this.baseUrl}/validate-token`,
        token ? { token } : {}
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Token validation failed");
    }
  }

  /**
   * Change user password
   */
  async changePassword(request: PasswordChangeRequest): Promise<void> {
    try {
      await apiClient.post<void>(`${this.baseUrl}/change-password`, request);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Password change failed");
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<{
    message: string;
  }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseUrl}/reset-password`,
        request
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Password reset request failed");
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(request: PasswordResetConfirm): Promise<{
    message: string;
  }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseUrl}/reset-password/confirm`,
        request
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Password reset confirmation failed");
    }
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(request: EmailVerificationRequest): Promise<{
    message: string;
  }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseUrl}/verify-email/request`,
        request
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Email verification request failed");
    }
  }

  /**
   * Confirm email verification
   */
  async confirmEmailVerification(request: EmailVerificationConfirm): Promise<EmailVerificationResponse> {
    try {
      const response = await apiClient.post<EmailVerificationResponse>(
        `${this.baseUrl}/verify-email/confirm`,
        request
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Email verification failed");
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(): Promise<SessionListResponse> {
    try {
      const response = await apiClient.get<SessionListResponse>(
        `${this.baseUrl}/sessions`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Failed to get sessions");
    }
  }

  /**
   * Revoke sessions
   */
  async revokeSessions(request: RevokeSessionRequest): Promise<{
    message: string;
    revoked_sessions: number;
  }> {
    try {
      const response = await apiClient.post<{
        message: string;
        revoked_sessions: number;
      }>(`${this.baseUrl}/sessions/revoke`, request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Failed to revoke sessions");
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>("/api/v1/users/me");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Failed to get current user");
    }
  }

  /**
   * Update current user
   */
  async updateCurrentUser(userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.put<UserProfile>(
        "/api/v1/users/me",
        userData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Failed to update user");
    }
  }

  /**
   * Check username availability
   */
  async checkUsernameAvailability(username: string): Promise<{
    available: boolean;
    suggestions?: string[];
  }> {
    try {
      const response = await apiClient.get<{
        available: boolean;
        suggestions?: string[];
      }>(`/api/v1/users/check-username/${encodeURIComponent(username)}`);
      return response.data;
    } catch (error: any) {
      // If endpoint doesn't exist, assume available for now
      return { available: true };
    }
  }

  /**
   * Check email availability
   */
  async checkEmailAvailability(email: string): Promise<{
    available: boolean;
    registered: boolean;
  }> {
    try {
      const response = await apiClient.get<{
        available: boolean;
        registered: boolean;
      }>(`/api/v1/users/check-email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error: any) {
      // If endpoint doesn't exist, assume available for now
      return { available: true, registered: false };
    }
  }
}

// Export singleton instance
export const authApi = new AuthApi();
