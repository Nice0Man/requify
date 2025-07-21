/**
 * OAuth2 API Client
 * Интегрирован с обновленным authApi
 * Использует только access_token и refresh_token (без дублирования)
 */

import { authApi } from "@/features/auth/api/authApi";
import type {
  LoginResponse,
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
 * OAuth2 Storage Keys - унифицированные ключи
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  TOKEN_EXPIRES_AT: "token_expires_at",
  USER_DATA: "user_data",
} as const;

/**
 * OAuth2 API класс для работы с аутентификацией
 * Использует только стандартные токены OAuth2: access_token и refresh_token
 */
export class OAuth2API {
  private static instance: OAuth2API;
  private refreshPromise: Promise<LoginResponse> | null = null;

  private constructor() {
    // Автоматическое обновление токенов каждые 30 секунд
    setInterval(() => {
      this.autoRefreshToken().catch(console.error);
    }, 30000);
  }

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
  async login(credentials: {
    username: string;
    password: string;
  }): Promise<LoginResponse> {
    try {
      console.info(
        "🔐 OAuth2API: Attempting login for user:",
        credentials.username
      );

      const loginData = {
        username: credentials.username,
        password: credentials.password,
      };

      const response = await authApi.login(loginData);
      console.info("✅ OAuth2API: Login API response received");

      // Стандартизированная обработка токенов
      await this.saveTokens(response);

      return response;
    } catch (error) {
      console.error("❌ OAuth2API: Login failed:", error);

      // Очищаем токены при неудачном логине
      this.clearTokens();

      throw error;
    }
  }

  /**
   * Обновление токенов
   */
  async refreshTokens(_refreshToken?: string): Promise<LoginResponse> {
    // Предотвращаем одновременные запросы обновления
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    try {
      const token = _refreshToken || this.getRefreshToken();

      if (!token) {
        console.error("❌ OAuth2API: No refresh token available");
        throw new Error("No refresh token available");
      }

      console.info("🔄 OAuth2API: Refreshing tokens...");

      this.refreshPromise = authApi.refreshToken({ refreshToken: token });
      const response = await this.refreshPromise;

      console.info("✅ OAuth2API: Token refresh API response received");

      // Стандартизированная обработка токенов
      await this.saveTokens(response);

      return response;
    } catch (error) {
      console.error("❌ OAuth2API: Token refresh failed:", error);

      // Очищаем токены при неудачном обновлении
      this.clearTokens();

      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Сохранение токенов (унифицированный метод)
   */
  private async saveTokens(response: LoginResponse): Promise<void> {
    const accessToken = response.access_token || response.token;
    const refreshToken = response.refresh_token || response.refreshToken;
    const expiresIn = response.expires_in || 3600; // По умолчанию 1 час

    if (!accessToken) {
      console.error("❌ OAuth2API: No access token in response:", response);
      throw new Error("No access token received from server");
    }

    console.info("🔐 OAuth2API: Saving tokens to localStorage");

    // Сохраняем только стандартные OAuth2 токены
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

    // Рассчитываем время истечения токена
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    localStorage.setItem(
      STORAGE_KEYS.TOKEN_EXPIRES_AT,
      expiresAt.toISOString()
    );

    // Сохраняем данные пользователя если есть
    if (response.user) {
      localStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(response.user)
      );
    }

    console.info("✅ OAuth2API: Tokens saved successfully", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: Math.round(expiresIn / 60),
    });

    // Удаляем старые дублированные токены если они есть
    this.cleanupLegacyTokens();
  }

  /**
   * Удаление устаревших дублированных токенов
   */
  private cleanupLegacyTokens(): void {
    const legacyKeys = ["authToken", "refreshToken", "token", "user_profile"];
    legacyKeys.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.debug(`🔐 OAuth2API: Removed legacy token: ${key}`);
      }
    });
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
  async confirmPasswordReset(
    request: ResetPasswordConfirmRequest
  ): Promise<void> {
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
  async validateToken(
    request: ValidateTokenRequest
  ): Promise<ValidateTokenResponse> {
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
  async requestEmailVerification(
    request: EmailVerificationRequest
  ): Promise<void> {
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
  async confirmEmailVerification(
    request: EmailVerificationConfirmRequest
  ): Promise<void> {
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
    const token = this.getAccessToken();
    const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);

    if (!token) {
      console.debug("🔐 OAuth2API: No access token found - not authenticated");
      return false;
    }

    if (!expiresAt) {
      // Если нет времени истечения, считаем токен истекшим для безопасности
      console.debug(
        "🔐 OAuth2API: No expiry time found - token considered expired"
      );
      return false;
    }

    // Проверяем, не истёк ли токен
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const isValid = expiryDate > now;

    if (!isValid) {
      console.debug("🔐 OAuth2API: Token expired", {
        expiresAt: expiryDate.toISOString(),
        now: now.toISOString(),
      });
    } else {
      const minutesUntilExpiry = Math.round(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60)
      );
      console.debug("🔐 OAuth2API: Token is valid", {
        expiresAt: expiryDate.toISOString(),
        minutesUntilExpiry,
      });
    }

    return isValid;
  }

  /**
   * Получение access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Получение refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Получение времени истечения токена
   */
  getTokenExpiryTime(): Date | null {
    const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    return expiresAt ? new Date(expiresAt) : null;
  }

  /**
   * Очистка токенов
   */
  clearTokens(): void {
    console.info("🔐 OAuth2API: Clearing all tokens from localStorage");

    // Очищаем только наши токены
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    // Очищаем и старые токены для полной очистки
    this.cleanupLegacyTokens();

    console.info("✅ OAuth2API: All tokens cleared successfully");
  }

  /**
   * Проверка необходимости обновления токена
   */
  shouldRefreshToken(): boolean {
    const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    const refreshToken = this.getRefreshToken();

    if (!expiresAt || !refreshToken) {
      return false;
    }

    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const minutesUntilExpiry =
      (expiryDate.getTime() - now.getTime()) / (1000 * 60);

    // Обновляем токен за 5 минут до истечения
    const shouldRefresh = minutesUntilExpiry <= 5 && minutesUntilExpiry > -60; // Даем час на обновление просроченного токена

    if (shouldRefresh) {
      console.debug("🔐 OAuth2API: Token refresh needed", {
        expiresAt: expiryDate.toISOString(),
        minutesUntilExpiry: Math.round(minutesUntilExpiry),
        hasRefreshToken: !!refreshToken,
      });
    }

    return shouldRefresh;
  }

  /**
   * Автоматическое обновление токена при необходимости
   */
  async autoRefreshToken(): Promise<void> {
    if (this.shouldRefreshToken() && !this.refreshPromise) {
      try {
        console.info("🔄 OAuth2API: Auto-refreshing token...");
        await this.refreshTokens();
        console.info("✅ OAuth2API: Auto-refresh completed successfully");
      } catch (error) {
        console.error("❌ OAuth2API: Auto-refresh failed:", error);
        // При неудачном автообновлении не очищаем токены - пользователь может продолжить работу
      }
    }
  }

  /**
   * Получение информации о текущем пользователе
   */
  async getCurrentUser(): Promise<LoginResponse["user"]> {
    try {
      // Сначала пытаемся получить из кэша
      const cachedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (cachedUser) {
        try {
          return JSON.parse(cachedUser);
        } catch (error) {
          console.warn("Failed to parse cached user data:", error);
        }
      }

      // Если нет в кэше, запрашиваем с сервера
      const user = await authApi.getMe();
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  }

  /**
   * Обновление информации о текущем пользователе
   */
  async updateCurrentUser(
    userData: Partial<LoginResponse["user"]>
  ): Promise<LoginResponse["user"]> {
    try {
      const user = await authApi.updateMe(userData);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("Failed to update current user:", error);
      throw error;
    }
  }

  /**
   * Получение статистики токенов для отладки
   */
  getTokenDebugInfo() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiryTime = this.getTokenExpiryTime();
    const isAuthenticated = this.isAuthenticated();
    const shouldRefresh = this.shouldRefreshToken();

    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasExpiryTime: !!expiryTime,
      isAuthenticated,
      shouldRefresh,
      expiryTime: expiryTime?.toISOString(),
      minutesUntilExpiry: expiryTime
        ? Math.round((expiryTime.getTime() - Date.now()) / (1000 * 60))
        : null,
      accessTokenPreview: accessToken
        ? `${accessToken.substring(0, 20)}...`
        : null,
      refreshTokenPreview: refreshToken
        ? `${refreshToken.substring(0, 20)}...`
        : null,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await authApi.forgotPassword(email);
    } catch (error) {
      console.error("Failed to request password reset:", error);
      throw error;
    }
  }
}

// Singleton instance
export const oauth2API = OAuth2API.getInstance();
