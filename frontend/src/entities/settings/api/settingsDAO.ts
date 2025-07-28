/**
 * Settings Data Access Object (DAO)
 * Использует существующие API endpoints для работы с настройками
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import { userDAO } from "@/entities/user";

import type {
  UserSettings,
  UserSettingsUpdate,
  SettingsResponse,
  UserProfileSettings,
  NotificationSettings,
  SecuritySettings,
  InterfaceSettings,
  PrivacySettings,
} from "../model/types";
import type { UserProfile, UserPreferences } from "@/entities/user";
import { dashboardApi } from "@/entities/dashboard";

/**
 * SettingsDAO - класс для работы с настройками пользователя
 */
export class SettingsDAO {
  private static instance: SettingsDAO;

  private constructor() {}

  public static getInstance(): SettingsDAO {
    if (!SettingsDAO.instance) {
      SettingsDAO.instance = new SettingsDAO();
    }
    return SettingsDAO.instance;
  }

  // =============================================================================
  // Получение настроек
  // =============================================================================

  /**
   * Получить все настройки текущего пользователя
   */
  async getAllSettings(): Promise<UserSettings> {
    try {
      // Получаем данные из разных endpoints
      const [profile, userSettings, dashboardPrefs] = await Promise.all([
        userDAO.getCurrentUserProfile(),
        userDAO.getCurrentUserSettings(),
        dashboardApi.getPreferences(),
      ]);

      // Преобразуем в нужный формат
      return this.transformToUserSettings(
        profile,
        userSettings,
        dashboardPrefs
      );
    } catch (error) {
      console.error("Failed to get all settings:", error);
      throw error;
    }
  }

  /**
   * Получить настройки профиля
   */
  async getProfileSettings(): Promise<UserProfileSettings> {
    try {
      const profile = await userDAO.getCurrentUserProfile();
      return {
        firstName: profile.full_name?.split(" ")[0] || "",
        lastName: profile.full_name?.split(" ")[1] || "",
        email: profile.email,
        phone: profile.phone,
        position: "", // Нужно добавить в API
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        timezone: profile.timezone,
      };
    } catch (error) {
      console.error("Failed to get profile settings:", error);
      throw error;
    }
  }

  // =============================================================================
  // Обновление настроек
  // =============================================================================

  /**
   * Обновить настройки профиля
   */
  async updateProfileSettings(
    settings: Partial<UserProfileSettings>
  ): Promise<SettingsResponse> {
    try {
      const updateData: any = {};

      if (settings.firstName || settings.lastName) {
        updateData.full_name = `${settings.firstName || ""} ${
          settings.lastName || ""
        }`.trim();
      }

      if (settings.email) updateData.email = settings.email;
      if (settings.phone) updateData.phone = settings.phone;
      if (settings.bio) updateData.bio = settings.bio;
      if (settings.avatar_url) updateData.avatar_url = settings.avatar_url;
      if (settings.timezone) updateData.timezone = settings.timezone;

      await userDAO.updateCurrentUserProfile(updateData);

      return {
        success: true,
        message: "Профиль успешно обновлен",
      };
    } catch (error) {
      console.error("Failed to update profile settings:", error);
      return {
        success: false,
        message: "Ошибка при обновлении профиля",
      };
    }
  }

  /**
   * Обновить настройки уведомлений
   */
  async updateNotificationSettings(
    settings: Partial<NotificationSettings>
  ): Promise<SettingsResponse> {
    try {
      const currentSettings = await userDAO.getCurrentUserSettings();

      const updatedSettings = {
        ...currentSettings,
        notifications: {
          ...currentSettings.notifications,
          ...settings,
        },
      };

      await userDAO.updateCurrentUserSettings(updatedSettings as any);

      return {
        success: true,
        message: "Настройки уведомлений обновлены",
      };
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      return {
        success: false,
        message: "Ошибка при обновлении настроек уведомлений",
      };
    }
  }

  /**
   * Обновить настройки интерфейса
   */
  async updateInterfaceSettings(
    settings: Partial<InterfaceSettings>
  ): Promise<SettingsResponse> {
    try {
      // Обновляем настройки интерфейса через dashboard preferences
      const currentPrefs = await dashboardApi.getPreferences();

      const updatedPrefs = {
        ...currentPrefs,
        theme: settings.theme || currentPrefs.theme,
        // Другие настройки интерфейса
      };

      // Обновляем preferences через API
      await dashboardApi.updatePreferences(updatedPrefs);

      // Также обновляем в user settings если нужно
      if (settings.language || settings.timezone) {
        const currentUserSettings = await userDAO.getCurrentUserSettings();
        const updatedUserSettings = {
          ...currentUserSettings,
          interface: {
            ...currentUserSettings.interface,
            language:
              settings.language || currentUserSettings.interface.language,
            timezone:
              settings.timezone || currentUserSettings.interface.timezone,
          },
        };
        await userDAO.updateCurrentUserSettings(updatedUserSettings as any);
      }

      return {
        success: true,
        message: "Настройки интерфейса обновлены",
      };
    } catch (error) {
      console.error("Failed to update interface settings:", error);
      return {
        success: false,
        message: "Ошибка при обновлении настроек интерфейса",
      };
    }
  }

  /**
   * Изменить пароль
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<SettingsResponse> {
    try {
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: "Пароли не совпадают",
        };
      }

      await userDAO.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      return {
        success: true,
        message: "Пароль успешно изменен",
      };
    } catch (error) {
      console.error("Failed to change password:", error);
      return {
        success: false,
        message: "Ошибка при смене пароля",
      };
    }
  }

  // =============================================================================
  // Сессии
  // =============================================================================

  /**
   * Получить активные сессии
   */
  async getUserSessions(): Promise<any[]> {
    try {
      const response = await client.get(API_ENDPOINTS.AUTH.SESSIONS);
      return response.data?.sessions || [];
    } catch (error) {
      console.error("Failed to get user sessions:", error);
      return [];
    }
  }

  /**
   * Отозвать сессии
   */
  async revokeSessions(sessionIds?: string[]): Promise<SettingsResponse> {
    try {
      await client.post(API_ENDPOINTS.AUTH.SESSIONS_REVOKE, {
        session_ids: sessionIds,
      });

      return {
        success: true,
        message: sessionIds
          ? "Выбранные сессии отозваны"
          : "Все сессии отозваны",
      };
    } catch (error) {
      console.error("Failed to revoke sessions:", error);
      return {
        success: false,
        message: "Ошибка при отзыве сессий",
      };
    }
  }

  // =============================================================================
  // Вспомогательные методы
  // =============================================================================

  /**
   * Преобразование данных API в UserSettings
   */
  private transformToUserSettings(
    profile: UserProfile,
    userSettings: any,
    dashboardPrefs: any
  ): UserSettings {
    return {
      profile: {
        firstName: profile.full_name?.split(" ")[0] || "",
        lastName: profile.full_name?.split(" ")[1] || "",
        email: profile.email,
        phone: profile.phone,
        position: "", // TODO: добавить в API
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        timezone: profile.timezone,
      },
      notifications: {
        email_notifications:
          userSettings?.notifications?.email_notifications ?? true,
        push_notifications:
          userSettings?.notifications?.push_notifications ?? true,
        project_updates: userSettings?.notifications?.project_updates ?? true,
        requirement_changes:
          userSettings?.notifications?.requirement_assignments ?? true,
        release_notifications:
          userSettings?.notifications?.weekly_digest ?? true,
        team_invitations: true, // TODO: добавить в API
        system_notifications: false,
        weekly_digest: userSettings?.notifications?.weekly_digest ?? true,
        mention_notifications:
          userSettings?.notifications?.mention_notifications ?? true,
      },
      security: {
        two_factor_auth: false, // TODO: добавить в API
        login_notifications: true,
        session_timeout: 30,
        allow_multiple_sessions: true,
        auto_logout: false,
      },
      interface: {
        theme: dashboardPrefs?.theme || "light",
        language: userSettings?.interface?.language || "ru",
        timezone: userSettings?.interface?.timezone || "Europe/Moscow",
        date_format: userSettings?.interface?.date_format || "DD.MM.YYYY",
        time_format: userSettings?.interface?.time_format || "24h",
        compact_mode: false,
        sidebar_collapsed: false,
        show_hints: true,
        animations_enabled: true,
      },
      privacy: {
        profile_visibility: "team",
        show_email: false,
        show_phone: false,
        activity_visibility: true,
      },
    };
  }
}

// Экспортируем singleton instance
export const settingsDAO = SettingsDAO.getInstance();
