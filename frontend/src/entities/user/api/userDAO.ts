/**
 * User Data Access Object (DAO)
 * Основано на схемах из backend/app/schemas/user.py
 */

import { client } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  User,
  UserCreate,
  UserUpdate,
  UserWithStats,
  UserProfile,
  UserPasswordChange,
  UserPasswordReset,
  UserPasswordResetConfirm,
  EmailVerificationRequest,
  EmailVerificationConfirm,
  UserListResponse,
  UserDetailResponse,
  UserActivityResponse,
  UserQueryParams,
  UserBulkOperation,
  UserImportData,
  UserExportOptions,
  UserValidationResult,
  UserAuditListResponse,
  UserPreferences,
  UserSettings,
} from "@/shared/types/user";

/**
 * UserDAO - класс для работы с API пользователей
 */
export class UserDAO {
  private static instance: UserDAO;

  private constructor() {}

  /**
   * Получить singleton instance
   */
  public static getInstance(): UserDAO {
    if (!UserDAO.instance) {
      UserDAO.instance = new UserDAO();
    }
    return UserDAO.instance;
  }

  // === CRUD операции ===

  /**
   * Получить список пользователей
   */
  async getUsers(params?: UserQueryParams): Promise<UserListResponse> {
    try {
      const response = await client.get<UserListResponse>("/users", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to get users:", error);
      throw error;
    }
  }

  /**
   * Получить пользователя по ID
   */
  async getUserById(id: number): Promise<UserDetailResponse> {
    try {
      const response = await client.get<UserDetailResponse>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить пользователя по username
   */
  async getUserByUsername(username: string): Promise<UserDetailResponse> {
    try {
      const response = await client.get<UserDetailResponse>(
        `/users/username/${username}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get user by username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Получить пользователя по email
   */
  async getUserByEmail(email: string): Promise<UserDetailResponse> {
    try {
      const response = await client.get<UserDetailResponse>(
        `/users/email/${email}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Создать нового пользователя
   */
  async createUser(userData: UserCreate): Promise<User> {
    try {
      const response = await client.post<User>("/users", userData);
      return response.data;
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  }

  /**
   * Обновить пользователя
   */
  async updateUser(id: number, userData: UserUpdate): Promise<User> {
    try {
      const response = await client.put<User>(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Частично обновить пользователя
   */
  async patchUser(id: number, userData: Partial<UserUpdate>): Promise<User> {
    try {
      const response = await client.patch<User>(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Failed to patch user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить пользователя
   */
  async deleteUser(id: number): Promise<void> {
    try {
      await client.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw error;
    }
  }

  // === Профиль и аутентификация ===

  /**
   * Получить профиль текущего пользователя
   */
  async getCurrentUserProfile(): Promise<UserProfile> {
    try {
      const response = await client.get<UserProfile>(API_ENDPOINTS.USERS.ME);
      return response.data;
    } catch (error) {
      console.error("Failed to get current user profile:", error);
      throw error;
    }
  }

  /**
   * Обновить профиль текущего пользователя
   */
  async updateCurrentUserProfile(userData: UserUpdate): Promise<UserProfile> {
    try {
      const response = await client.put<UserProfile>(API_ENDPOINTS.USERS.UPDATE_ME, userData);
      return response.data;
    } catch (error) {
      console.error("Failed to update current user profile:", error);
      throw error;
    }
  }

  /**
   * Получить публичный профиль пользователя
   */
  async getUserPublicProfile(id: number): Promise<UserProfile> {
    try {
      const response = await client.get<UserProfile>(`/users/${id}/profile`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get public profile for user ${id}:`, error);
      throw error;
    }
  }

  // === Управление паролем ===

  /**
   * Сменить пароль
   */
  async changePassword(data: UserPasswordChange): Promise<void> {
    try {
      await client.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    } catch (error) {
      console.error("Failed to change password:", error);
      throw error;
    }
  }

  /**
   * Запросить сброс пароля
   */
  async requestPasswordReset(data: UserPasswordReset): Promise<void> {
    try {
      await client.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    } catch (error) {
      console.error("Failed to request password reset:", error);
      throw error;
    }
  }

  /**
   * Подтвердить сброс пароля
   */
  async confirmPasswordReset(data: UserPasswordResetConfirm): Promise<void> {
    try {
      await client.post(API_ENDPOINTS.AUTH.RESET_PASSWORD_CONFIRM, data);
    } catch (error) {
      console.error("Failed to confirm password reset:", error);
      throw error;
    }
  }

  // === Верификация email ===

  /**
   * Запросить верификацию email
   */
  async requestEmailVerification(
    data: EmailVerificationRequest
  ): Promise<void> {
    try {
      await client.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL_REQUEST, data);
    } catch (error) {
      console.error("Failed to request email verification:", error);
      throw error;
    }
  }

  /**
   * Подтвердить верификацию email
   */
  async confirmEmailVerification(
    data: EmailVerificationConfirm
  ): Promise<void> {
    try {
      await client.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL_CONFIRM, data);
    } catch (error) {
      console.error("Failed to confirm email verification:", error);
      throw error;
    }
  }

  // === Статистика и активность ===

  /**
   * Получить пользователя со статистикой
   */
  async getUserWithStats(id: number): Promise<UserWithStats> {
    try {
      const response = await client.get<UserWithStats>(`/users/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get user stats for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить активность пользователя
   */
  async getUserActivity(id: number): Promise<UserActivityResponse> {
    try {
      const response = await client.get<UserActivityResponse>(
        `/users/${id}/activity`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get user activity for ${id}:`, error);
      throw error;
    }
  }

  // === Массовые операции ===

  /**
   * Выполнить массовую операцию над пользователями
   */
  async bulkOperation(operation: UserBulkOperation): Promise<void> {
    try {
      await client.post("/users/bulk", operation);
    } catch (error) {
      console.error("Failed to perform bulk operation:", error);
      throw error;
    }
  }

  /**
   * Импорт пользователей
   */
  async importUsers(data: UserImportData): Promise<void> {
    try {
      await client.post("/users/import", data);
    } catch (error) {
      console.error("Failed to import users:", error);
      throw error;
    }
  }

  /**
   * Экспорт пользователей
   */
  async exportUsers(options: UserExportOptions): Promise<Blob> {
    try {
      const response = await client.post("/users/export", options, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Failed to export users:", error);
      throw error;
    }
  }

  // === Валидация ===

  /**
   * Валидация данных пользователя
   */
  async validateUser(
    userData: UserCreate | UserUpdate
  ): Promise<UserValidationResult> {
    try {
      const response = await client.post<UserValidationResult>(
        "/users/validate",
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Failed to validate user data:", error);
      throw error;
    }
  }

  /**
   * Проверка доступности username
   */
  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await client.get<{ available: boolean }>(
        `/users/check-username/${username}`
      );
      return response.data.available;
    } catch (error) {
      console.error("Failed to check username availability:", error);
      throw error;
    }
  }

  /**
   * Проверка доступности email
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await client.get<{ available: boolean }>(
        `/users/check-email/${email}`
      );
      return response.data.available;
    } catch (error) {
      console.error("Failed to check email availability:", error);
      throw error;
    }
  }

  // === Аудит ===

  /**
   * Получить логи аудита пользователя
   */
  async getUserAuditLogs(
    id: number,
    page = 1,
    perPage = 20
  ): Promise<UserAuditListResponse> {
    try {
      const response = await client.get<UserAuditListResponse>(
        `/users/${id}/audit`,
        {
          params: { page, per_page: perPage },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get audit logs for user ${id}:`, error);
      throw error;
    }
  }

  // === Настройки пользователя ===

  /**
   * Получить настройки пользователя
   */
  async getUserSettings(id: number): Promise<UserSettings> {
    try {
      const response = await client.get<UserSettings>(`/users/${id}/settings`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get settings for user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Обновить настройки пользователя
   */
  async updateUserSettings(
    id: number,
    settings: UserPreferences
  ): Promise<UserSettings> {
    try {
      const response = await client.put<UserSettings>(
        `/users/${id}/settings`,
        settings
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update settings for user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить настройки текущего пользователя
   */
  async getCurrentUserSettings(): Promise<UserSettings> {
    try {
      const response = await client.get<UserSettings>("/users/me/settings");
      return response.data;
    } catch (error) {
      console.error("Failed to get current user settings:", error);
      throw error;
    }
  }

  /**
   * Обновить настройки текущего пользователя
   */
  async updateCurrentUserSettings(
    settings: UserPreferences
  ): Promise<UserSettings> {
    try {
      const response = await client.put<UserSettings>(
        "/users/me/settings",
        settings
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update current user settings:", error);
      throw error;
    }
  }

  // === Поиск ===

  /**
   * Поиск пользователей
   */
  async searchUsers(
    query: string,
    filters?: UserQueryParams
  ): Promise<UserListResponse> {
    try {
      const response = await client.get<UserListResponse>("/users/search", {
        params: { q: query, ...filters },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to search users:", error);
      throw error;
    }
  }

  // === Активация/деактивация ===

  /**
   * Активировать пользователя
   */
  async activateUser(id: number): Promise<void> {
    try {
      await client.post(`/users/${id}/activate`);
    } catch (error) {
      console.error(`Failed to activate user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Деактивировать пользователя
   */
  async deactivateUser(id: number): Promise<void> {
    try {
      await client.post(`/users/${id}/deactivate`);
    } catch (error) {
      console.error(`Failed to deactivate user ${id}:`, error);
      throw error;
    }
  }
}

// Экспортируем singleton instance
export const userDAO = UserDAO.getInstance();
