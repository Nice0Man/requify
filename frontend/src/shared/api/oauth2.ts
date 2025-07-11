/**
 * OAuth2 API Client
 * Интегрирован с обновленным authApi
 */

import { client } from "./client";
import { authApi } from "@/features/auth/api/authApi";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmRequest,
  ValidateTokenRequest,
  ValidateTokenResponse,
  EmailVerificationRequest,
  EmailVerificationConfirmRequest,
  UserSession,
} from "@/features/auth/api/authApi";

/**
 * OAuth2 API класс для работы с аутентификацией
 * Использует обновленный authApi
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
  async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
    try {
      // Передаем данные как есть - бэкенд ожидает username и password
      const loginData = {
        username: credentials.username,
        password: credentials.password,
      };

      const response = await authApi.login(loginData);

      // Сохраняем токены в разных форматах для совместимости
      if (response.token) {
        localStorage.setItem("access_token", response.token);
        localStorage.setItem("authToken", response.token);    // Для совместимости с API client
      }
      if (response.refreshToken) {
        localStorage.setItem("refresh_token", response.refreshToken);
        localStorage.setItem("refreshToken", response.refreshToken);  // Для совместимости с API client
      }

      // Устанавливаем время истечения (предполагаем 1 час для access token)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      localStorage.setItem("token_expires_at", expiresAt.toISOString());

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  /**
   * Обновление токенов
   */
  async refreshTokens(refreshToken?: string): Promise<LoginResponse> {
    try {
      const token = refreshToken || localStorage.getItem("refresh_token");

      if (!token) {
        throw new Error("No refresh token available");
      }

      const response = await authApi.refreshToken({ refreshToken: token });

      // Обновляем токены в разных форматах для совместимости
      if (response.token) {
        localStorage.setItem("access_token", response.token);
        localStorage.setItem("authToken", response.token);    // Для совместимости с API client
      }
      if (response.refreshToken) {
        localStorage.setItem("refresh_token", response.refreshToken);
        localStorage.setItem("refreshToken", response.refreshToken);  // Для совместимости с API client
      }

      // Обновляем время истечения
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      localStorage.setItem("token_expires_at", expiresAt.toISOString());

      return response;
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
  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Всегда очищаем локальные токены
      this.clearTokens();
    }
  }

  /**
   * Смена пароля
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    try {
      await authApi.changePassword(request);
    } catch (error) {
      console.error("Password change failed:", error);
      throw error;
    }
  }

  /**
   * Запрос сброса пароля
   */
  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    try {
      await authApi.resetPassword(request);
    } catch (error) {
      console.error("Password reset request failed:", error);
      throw error;
    }
  }

  /**
   * Подтверждение сброса пароля
   */
  async confirmPasswordReset(request: ResetPasswordConfirmRequest): Promise<void> {
    try {
      await authApi.confirmResetPassword(request);
    } catch (error) {
      console.error("Password reset confirmation failed:", error);
      throw error;
    }
  }

  /**
   * Валидация токена
   */
  async validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    try {
      return await authApi.validateToken(request);
    } catch (error) {
      console.error("Token validation failed:", error);
      throw error;
    }
  }

  /**
   * Запрос верификации email
   */
  async requestEmailVerification(request: EmailVerificationRequest): Promise<void> {
    try {
      await authApi.requestEmailVerification(request);
    } catch (error) {
      console.error("Email verification request failed:", error);
      throw error;
    }
  }

  /**
   * Подтверждение верификации email
   */
  async confirmEmailVerification(request: EmailVerificationConfirmRequest): Promise<void> {
    try {
      await authApi.confirmEmailVerification(request);
    } catch (error) {
      console.error("Email verification confirmation failed:", error);
      throw error;
    }
  }

  /**
   * Получение списка сессий пользователя
   */
  async getSessions(): Promise<UserSession[]> {
    try {
      return await authApi.getUserSessions();
    } catch (error) {
      console.error("Failed to get sessions:", error);
      throw error;
    }
  }

  /**
   * Отзыв сессий
   */
  async revokeSession(sessionIds?: string[]): Promise<void> {
    try {
      await authApi.revokeSessions(sessionIds);
    } catch (error) {
      console.error("Failed to revoke sessions:", error);
      throw error;
    }
  }

  /**
   * Проверка аутентификации
   */
  isAuthenticated(): boolean {
    // Проверяем различные варианты хранения токенов
    const token = localStorage.getItem("access_token") || 
                  localStorage.getItem("authToken");
    const expiresAt = localStorage.getItem("token_expires_at");

    if (!token) {
      return false;
    }

    if (!expiresAt) {
      // Если нет времени истечения, считаем токен валидным (для совместимости)
      return true;
    }

    // Проверяем, не истёк ли токен
    const expiryDate = new Date(expiresAt);
    return expiryDate > new Date();
  }

  /**
   * Получение access token
   */
  getAccessToken(): string | null {
    if (this.isAuthenticated()) {
      // Проверяем различные варианты хранения токенов
      return localStorage.getItem("access_token") || 
             localStorage.getItem("authToken") || 
             null;
    }
    return null;
  }

  /**
   * Получение refresh token
   */
  getRefreshToken(): string | null {
    // Проверяем различные варианты хранения токенов
    return localStorage.getItem("refresh_token") || 
           localStorage.getItem("refreshToken") || 
           null;
  }

  /**
   * Очистка токенов
   */
  clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expires_at");
    // Очищаем также ключи для совместимости
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  }

  /**
   * Проверка необходимости обновления токена
   */
  shouldRefreshToken(): boolean {
    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return false;

    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const minutesUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60);

    // Обновляем токен за 5 минут до истечения
    return minutesUntilExpiry <= 5;
  }

  /**
   * Автоматическое обновление токена при необходимости
   */
  async autoRefreshToken(): Promise<void> {
    if (this.shouldRefreshToken()) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await this.refreshTokens(refreshToken);
      }
    }
  }

  /**
   * Получение информации о текущем пользователе
   */
  async getCurrentUser(): Promise<LoginResponse["user"]> {
    try {
      return await authApi.getMe();
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  }

  /**
   * Обновление информации о текущем пользователе
   */
  async updateCurrentUser(userData: Partial<LoginResponse["user"]>): Promise<LoginResponse["user"]> {
    try {
      return await authApi.updateMe(userData);
    } catch (error) {
      console.error("Failed to update current user:", error);
      throw error;
    }
  }
}

// Singleton instance
export const oauth2API = OAuth2API.getInstance();
