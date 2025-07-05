import { apiClient } from "@/shared/api/client";
import type {
  User,
  UserCreate,
  UserUpdate,
  UserWithStats,
  UserProfile,
  UserPreferences,
  UserSession,
  UserSettings,
  UserRole,
  UserStatus,
} from "../model/types";
import type { PaginatedResponse, ApiResponse } from "@/shared/types/api";

/**
 * Users API - слой взаимодействия с бэкендом для пользователей
 * В соответствии с принципами FSD, содержит только API функции без бизнес-логики
 */
export class UsersApi {
  private readonly baseUrl = "/users";

  /**
   * Получить список пользователей
   */
  async getUsers(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    is_active?: boolean;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}?${searchParams}`
      : this.baseUrl;

    return apiClient.get<PaginatedResponse<User>>(url).then((res) => res.data);
  }

  /**
   * Создать нового пользователя
   */
  async createUser(data: UserCreate): Promise<User> {
    return apiClient.post<User>(this.baseUrl, data).then((res) => res.data);
  }

  /**
   * Получить информацию о текущем пользователе
   */
  async getCurrentUser(): Promise<UserProfile> {
    return apiClient
      .get<UserProfile>(`${this.baseUrl}/me`)
      .then((res) => res.data);
  }

  /**
   * Обновить информацию о текущем пользователе
   */
  async updateCurrentUser(data: UserUpdate): Promise<User> {
    return apiClient
      .put<User>(`${this.baseUrl}/me`, data)
      .then((res) => res.data);
  }

  /**
   * Получить пользователя по ID
   */
  async getUser(userId: number): Promise<UserWithStats> {
    return apiClient
      .get<UserWithStats>(`${this.baseUrl}/${userId}`)
      .then((res) => res.data);
  }

  /**
   * Обновить пользователя
   */
  async updateUser(userId: number, data: UserUpdate): Promise<User> {
    return apiClient
      .put<User>(`${this.baseUrl}/${userId}`, data)
      .then((res) => res.data);
  }

  /**
   * Удалить пользователя
   */
  async deleteUser(userId: number): Promise<void> {
    return apiClient
      .delete<void>(`${this.baseUrl}/${userId}`)
      .then((res) => res.data);
  }

  /**
   * Активировать пользователя
   */
  async activateUser(
    userId: number,
    data?: {
      reason?: string;
      send_notification?: boolean;
    }
  ): Promise<ApiResponse<User>> {
    return apiClient
      .post<ApiResponse<User>>(`${this.baseUrl}/${userId}/activate`, data || {})
      .then((res) => res.data);
  }

  /**
   * Деактивировать пользователя
   */
  async deactivateUser(
    userId: number,
    data?: {
      reason?: string;
      send_notification?: boolean;
    }
  ): Promise<ApiResponse<User>> {
    return apiClient
      .post<ApiResponse<User>>(
        `${this.baseUrl}/${userId}/deactivate`,
        data || {}
      )
      .then((res) => res.data);
  }

  /**
   * Получить настройки пользователя
   */
  async getUserSettings(userId?: number): Promise<UserSettings> {
    const url = userId
      ? `${this.baseUrl}/${userId}/settings`
      : `${this.baseUrl}/me/settings`;
    return apiClient.get<UserSettings>(url).then((res) => res.data);
  }

  /**
   * Обновить настройки пользователя
   */
  async updateUserSettings(
    settings: Partial<UserSettings>,
    userId?: number
  ): Promise<UserSettings> {
    const url = userId
      ? `${this.baseUrl}/${userId}/settings`
      : `${this.baseUrl}/me/settings`;
    return apiClient.put<UserSettings>(url, settings).then((res) => res.data);
  }

  /**
   * Получить предпочтения пользователя
   */
  async getUserPreferences(userId?: number): Promise<UserPreferences> {
    const url = userId
      ? `${this.baseUrl}/${userId}/preferences`
      : `${this.baseUrl}/me/preferences`;
    return apiClient.get<UserPreferences>(url).then((res) => res.data);
  }

  /**
   * Обновить предпочтения пользователя
   */
  async updateUserPreferences(
    preferences: Partial<UserPreferences>,
    userId?: number
  ): Promise<UserPreferences> {
    const url = userId
      ? `${this.baseUrl}/${userId}/preferences`
      : `${this.baseUrl}/me/preferences`;
    return apiClient
      .put<UserPreferences>(url, preferences)
      .then((res) => res.data);
  }

  /**
   * Получить сессии пользователя
   */
  async getUserSessions(userId?: number): Promise<UserSession[]> {
    const url = userId
      ? `${this.baseUrl}/${userId}/sessions`
      : `${this.baseUrl}/me/sessions`;
    return apiClient.get<UserSession[]>(url).then((res) => res.data);
  }

  /**
   * Завершить сессию пользователя
   */
  async terminateUserSession(
    sessionId: string,
    userId?: number
  ): Promise<ApiResponse<void>> {
    const baseSessionUrl = userId
      ? `${this.baseUrl}/${userId}/sessions`
      : `${this.baseUrl}/me/sessions`;
    return apiClient
      .delete<ApiResponse<void>>(`${baseSessionUrl}/${sessionId}`)
      .then((res) => res.data);
  }

  /**
   * Завершить все сессии пользователя кроме текущей
   */
  async terminateAllOtherSessions(userId?: number): Promise<
    ApiResponse<{
      terminated_sessions: number;
    }>
  > {
    const url = userId
      ? `${this.baseUrl}/${userId}/sessions/terminate-all`
      : `${this.baseUrl}/me/sessions/terminate-all`;
    return apiClient
      .post<
        ApiResponse<{
          terminated_sessions: number;
        }>
      >(url)
      .then((res) => res.data);
  }

  /**
   * Изменить роль пользователя
   */
  async changeUserRole(
    userId: number,
    data: {
      role: UserRole;
      reason?: string;
      effective_date?: string;
    }
  ): Promise<ApiResponse<User>> {
    return apiClient
      .post<ApiResponse<User>>(`${this.baseUrl}/${userId}/change-role`, data)
      .then((res) => res.data);
  }

  /**
   * Сбросить пароль пользователя (админ функция)
   */
  async resetUserPassword(
    userId: number,
    data?: {
      temporary_password?: string;
      require_change_on_login?: boolean;
      send_email?: boolean;
    }
  ): Promise<
    ApiResponse<{
      temporary_password?: string;
      expires_at: string;
    }>
  > {
    return apiClient
      .post<
        ApiResponse<{
          temporary_password?: string;
          expires_at: string;
        }>
      >(`${this.baseUrl}/${userId}/reset-password`, data || {})
      .then((res) => res.data);
  }

  /**
   * Заблокировать пользователя
   */
  async suspendUser(
    userId: number,
    data: {
      reason: string;
      duration_days?: number;
      block_login?: boolean;
      send_notification?: boolean;
    }
  ): Promise<ApiResponse<User>> {
    return apiClient
      .post<ApiResponse<User>>(`${this.baseUrl}/${userId}/suspend`, data)
      .then((res) => res.data);
  }

  /**
   * Разблокировать пользователя
   */
  async unsuspendUser(
    userId: number,
    data?: {
      reason?: string;
      send_notification?: boolean;
    }
  ): Promise<ApiResponse<User>> {
    return apiClient
      .post<ApiResponse<User>>(
        `${this.baseUrl}/${userId}/unsuspend`,
        data || {}
      )
      .then((res) => res.data);
  }

  /**
   * Получить аватар пользователя
   */
  async getUserAvatar(
    userId: number,
    size?: "small" | "medium" | "large"
  ): Promise<Blob> {
    const sizeParam = size ? `?size=${size}` : "";
    return apiClient
      .get<Blob>(`${this.baseUrl}/${userId}/avatar${sizeParam}`)
      .then((res) => res.data);
  }

  /**
   * Загрузить аватар пользователя
   */
  async uploadUserAvatar(
    file: File,
    userId?: number
  ): Promise<
    ApiResponse<{
      avatar_url: string;
      thumbnail_url: string;
    }>
  > {
    const formData = new FormData();
    formData.append("avatar", file);

    const url = userId
      ? `${this.baseUrl}/${userId}/avatar`
      : `${this.baseUrl}/me/avatar`;

    return apiClient
      .post<
        ApiResponse<{
          avatar_url: string;
          thumbnail_url: string;
        }>
      >(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }

  /**
   * Удалить аватар пользователя
   */
  async deleteUserAvatar(userId?: number): Promise<ApiResponse<void>> {
    const url = userId
      ? `${this.baseUrl}/${userId}/avatar`
      : `${this.baseUrl}/me/avatar`;
    return apiClient.delete<ApiResponse<void>>(url).then((res) => res.data);
  }

  /**
   * Получить активность пользователя
   */
  async getUserActivity(
    userId: number,
    params?: {
      skip?: number;
      limit?: number;
      action_types?: string[];
      date_from?: string;
      date_to?: string;
    }
  ): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/${userId}/activity?${searchParams}`
      : `${this.baseUrl}/${userId}/activity`;

    return apiClient.get<PaginatedResponse<any>>(url).then((res) => res.data);
  }

  /**
   * Получить статистику пользователей
   */
  async getUsersStats(params?: {
    role?: UserRole[];
    status?: UserStatus[];
    date_from?: string;
    date_to?: string;
    group_by?: "role" | "status" | "department" | "date";
  }): Promise<{
    total_users: number;
    active_users: number;
    users_by_role: Record<string, number>;
    users_by_status: Record<string, number>;
    new_users_this_month: number;
    login_activity: Array<{
      date: string;
      unique_logins: number;
      total_sessions: number;
    }>;
    most_active_users: Array<{
      user_id: number;
      username: string;
      activity_score: number;
    }>;
  }> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/stats?${searchParams}`
      : `${this.baseUrl}/stats`;

    return apiClient
      .get<{
        total_users: number;
        active_users: number;
        users_by_role: Record<string, number>;
        users_by_status: Record<string, number>;
        new_users_this_month: number;
        login_activity: Array<{
          date: string;
          unique_logins: number;
          total_sessions: number;
        }>;
        most_active_users: Array<{
          user_id: number;
          username: string;
          activity_score: number;
        }>;
      }>(url)
      .then((res) => res.data);
  }

  /**
   * Массовые операции с пользователями
   */
  async bulkUpdateUsers(data: {
    user_ids: number[];
    updates: {
      role?: UserRole;
      status?: UserStatus;
      is_active?: boolean;
      department?: string;
    };
    reason?: string;
  }): Promise<
    ApiResponse<{
      updated: number;
      failed: number;
      errors: Array<{
        user_id: number;
        error: string;
      }>;
    }>
  > {
    return apiClient
      .post<
        ApiResponse<{
          updated: number;
          failed: number;
          errors: Array<{
            user_id: number;
            error: string;
          }>;
        }>
      >(`${this.baseUrl}/bulk-update`, data)
      .then((res) => res.data);
  }

  /**
   * Экспорт пользователей
   */
  async exportUsers(params?: {
    role?: UserRole[];
    status?: UserStatus[];
    include_activity?: boolean;
    include_settings?: boolean;
    format?: "excel" | "csv" | "json";
  }): Promise<Blob> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/export?${searchParams}`
      : `${this.baseUrl}/export`;

    return apiClient.get<Blob>(url).then((res) => res.data);
  }

  /**
   * Импорт пользователей
   */
  async importUsers(
    file: File,
    params?: {
      update_existing?: boolean;
      default_role?: UserRole;
      send_welcome_emails?: boolean;
      require_email_verification?: boolean;
    }
  ): Promise<{
    total_processed: number;
    successful_imports: number;
    failed_imports: number;
    errors: Array<{
      row: number;
      error: string;
      data?: any;
    }>;
    created_users: number[];
    updated_users: number[];
  }> {
    const formData = new FormData();
    formData.append("file", file);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }

    return apiClient
      .post<{
        total_processed: number;
        successful_imports: number;
        failed_imports: number;
        errors: Array<{
          row: number;
          error: string;
          data?: any;
        }>;
        created_users: number[];
        updated_users: number[];
      }>(`${this.baseUrl}/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }
}

// Экспортируем экземпляр API для использования в приложении
export const usersApi = new UsersApi();
