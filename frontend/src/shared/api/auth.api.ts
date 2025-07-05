import { apiClient, ApiResponse } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  TokenValidationRequest,
  TokenValidationResponse,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerificationRequest,
  EmailVerificationConfirm,
  EmailVerificationResponse,
  UserProfile,
  SessionListResponse,
  RevokeSessionRequest,
} from "@/shared/types/api";

// Import auth storage to get current token
import { authStorage } from "@/features/auth/model/auth.storage";

export class AuthApi {
  constructor(private client = apiClient) {}

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // OAuth2 expects form data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return this.client.post<LoginResponse>("/auth/login", formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    department?: string;
    phone?: string;
  }): Promise<ApiResponse<LoginResponse>> {
    return this.client.post<LoginResponse>("/auth/register", userData);
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>("/auth/logout");
  }

  async refreshToken(
    request: RefreshTokenRequest
  ): Promise<ApiResponse<RefreshTokenResponse>> {
    return this.client.post<RefreshTokenResponse>("/auth/refresh", request);
  }

  async validateToken(
    request?: TokenValidationRequest
  ): Promise<ApiResponse<TokenValidationResponse>> {
    // Если request не передан или нет токена, получаем текущий из storage
    const tokenToValidate = request?.token || authStorage.getAccessToken();
    
    // Проверяем что токен есть
    if (!tokenToValidate) {
      // Возвращаем результат с invalid вместо выброса ошибки
      const response: TokenValidationResponse = {
        valid: false,
        expires_at: undefined,
        user: undefined
      };
      
      return {
        data: response,
        status: 200, // Технически это успешный ответ с результатом "invalid"
        message: "No token available for validation"
      };
    }

    return this.client.post<TokenValidationResponse>(
      "/auth/validate-token",
      { token: tokenToValidate } // Всегда отправляем корректную схему TokenValidationRequest
    );
  }

  // Password management
  async changePassword(
    request: PasswordChangeRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(
      "/auth/change-password",
      request
    );
  }

  async requestPasswordReset(
    request: PasswordResetRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(
      "/auth/reset-password",
      request
    );
  }

  async confirmPasswordReset(
    request: PasswordResetConfirm
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(
      "/auth/reset-password/confirm",
      request
    );
  }

  // Email verification
  async requestEmailVerification(
    request: EmailVerificationRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(
      "/auth/verify-email/request",
      request
    );
  }

  async confirmEmailVerification(
    request: EmailVerificationConfirm
  ): Promise<ApiResponse<EmailVerificationResponse>> {
    return this.client.post<EmailVerificationResponse>(
      "/auth/verify-email/confirm",
      request
    );
  }

  // Session management
  async getSessions(): Promise<ApiResponse<SessionListResponse>> {
    return this.client.get<SessionListResponse>("/auth/sessions");
  }

  async revokeSessions(
    request: RevokeSessionRequest
  ): Promise<ApiResponse<{ message: string; revoked_count: number }>> {
    return this.client.post<{ message: string; revoked_count: number }>(
      "/auth/sessions/revoke",
      request
    );
  }

  // User profile
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return this.client.get<UserProfile>("/users/me");
  }

  async updateCurrentUser(
    userData: Partial<Pick<UserProfile, "email">>
  ): Promise<ApiResponse<UserProfile>> {
    return this.client.put<UserProfile>("/users/me", userData);
  }
}

// Export singleton instance
export const authApi = new AuthApi();
