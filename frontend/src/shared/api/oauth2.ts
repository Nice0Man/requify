/**
 * OAuth2 API Client
 * Основано на схемах из backend/app/schemas/auth.py
 */

import { client } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  TokenValidationRequest,
  TokenValidationResponse,
  EmailVerificationRequest,
  EmailVerificationConfirm,
  EmailVerificationResponse,
  SessionListResponse,
  RevokeSessionRequest,
} from "@/shared/types/auth";

/**
 * OAuth2 API класс для работы с аутентификацией
 */
export class OAuth2API {
  private static instance: OAuth2API;

  private constructor() {}

  /**
   * Получить singleton instance
   */
  public static getInstance(): OAuth2API {
    if (!OAuth2API.instance) {
      OAuth2API.instance = new OAuth2API();
    }
    return OAuth2API.instance;
  }

  /**
   * Логин пользователя
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // OAuth2 требует application/x-www-form-urlencoded для логина
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await client.post<LoginResponse>(
        "/auth/login",
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Сохраняем токены
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
      }
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }

      // Сохраняем время истечения
      const expiresAt = new Date(Date.now() + response.data.expires_in * 1000);
      localStorage.setItem("token_expires_at", expiresAt.toISOString());

      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  /**
   * Обновление токенов
   */
  async refreshTokens(
    request?: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    try {
      const refreshToken =
        request?.refresh_token || localStorage.getItem("refresh_token");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await client.post<RefreshTokenResponse>(
        "/auth/refresh",
        {
          refresh_token: refreshToken,
        }
      );

      // Обновляем токены
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
      }
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }

      // Обновляем время истечения
      const expiresAt = new Date(Date.now() + response.data.expires_in * 1000);
      localStorage.setItem("token_expires_at", expiresAt.toISOString());

      return response.data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Очищаем токены при неудачном обновлении
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Выход из системы
   */
  async logout(request?: LogoutRequest): Promise<LogoutResponse> {
    try {
      const refreshToken = localStorage.getItem("refresh_token");

      const logoutData: LogoutRequest = {
        refresh_token: refreshToken || undefined,
        logout_all: request?.logout_all || false,
      };

      const response = await client.post<LogoutResponse>(
        "/auth/logout",
        logoutData
      );

      // Очищаем локальные токены
      this.clearTokens();

      return response.data;
    } catch (error) {
      console.error("Logout failed:", error);
      // Всегда очищаем локальные токены даже при ошибке
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Смена пароля
   */
  async changePassword(request: PasswordChangeRequest): Promise<void> {
    try {
      await client.post("/auth/change-password", request);
    } catch (error) {
      console.error("Password change failed:", error);
      throw error;
    }
  }

  /**
   * Запрос сброса пароля
   */
  async resetPassword(request: PasswordResetRequest): Promise<void> {
    try {
      await client.post("/auth/reset-password", request);
    } catch (error) {
      console.error("Password reset request failed:", error);
      throw error;
    }
  }

  /**
   * Подтверждение сброса пароля
   */
  async confirmPasswordReset(request: PasswordResetConfirm): Promise<void> {
    try {
      await client.post("/auth/reset-password/confirm", request);
    } catch (error) {
      console.error("Password reset confirmation failed:", error);
      throw error;
    }
  }

  /**
   * Валидация токена
   */
  async validateToken(
    request: TokenValidationRequest
  ): Promise<TokenValidationResponse> {
    try {
      const response = await client.post<TokenValidationResponse>(
        "/auth/validate",
        request
      );
      return response.data;
    } catch (error) {
      console.error("Token validation failed:", error);
      throw error;
    }
  }

  /**
   * Запрос верификации email
   */
  async requestEmailVerification(
    request: EmailVerificationRequest
  ): Promise<void> {
    try {
      await client.post("/auth/verify-email", request);
    } catch (error) {
      console.error("Email verification request failed:", error);
      throw error;
    }
  }

  /**
   * Подтверждение верификации email
   */
  async confirmEmailVerification(
    request: EmailVerificationConfirm
  ): Promise<EmailVerificationResponse> {
    try {
      const response = await client.post<EmailVerificationResponse>(
        "/auth/verify-email/confirm",
        request
      );
      return response.data;
    } catch (error) {
      console.error("Email verification confirmation failed:", error);
      throw error;
    }
  }

  /**
   * Получение списка активных сессий
   */
  async getSessions(): Promise<SessionListResponse> {
    try {
      const response = await client.get<SessionListResponse>("/auth/sessions");
      return response.data;
    } catch (error) {
      console.error("Failed to get sessions:", error);
      throw error;
    }
  }

  /**
   * Отзыв сессии
   */
  async revokeSession(request: RevokeSessionRequest): Promise<void> {
    try {
      await client.post("/auth/sessions/revoke", request);
    } catch (error) {
      console.error("Session revocation failed:", error);
      throw error;
    }
  }

  /**
   * Проверка авторизации
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("token_expires_at");

    if (!token || !expiresAt) {
      return false;
    }

    // Проверяем не истек ли токен
    const expires = new Date(expiresAt);
    const now = new Date();

    return now < expires;
  }

  /**
   * Получение текущего токена
   */
  getAccessToken(): string | null {
    if (this.isAuthenticated()) {
      return localStorage.getItem("access_token");
    }
    return null;
  }

  /**
   * Получение refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  /**
   * Очистка токенов
   */
  clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expires_at");
  }

  /**
   * Проверка нужно ли обновить токен
   */
  shouldRefreshToken(): boolean {
    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return false;

    const expires = new Date(expiresAt);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Обновляем токен за 5 минут до истечения
    return expires <= fiveMinutesFromNow;
  }

  /**
   * Автоматическое обновление токена
   */
  async autoRefreshToken(): Promise<void> {
    if (this.shouldRefreshToken() && this.getRefreshToken()) {
      try {
        await this.refreshTokens();
      } catch (error) {
        console.error("Auto refresh failed:", error);
        // Если автообновление не удалось, очищаем токены
        this.clearTokens();
        throw error;
      }
    }
  }
}

// Экспортируем singleton instance
export const oauth2API = OAuth2API.getInstance();
