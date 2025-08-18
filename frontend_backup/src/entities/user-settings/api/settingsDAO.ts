/**
 * Settings Data Access Object (DAO)
 * Использует существующие API endpoints для работы с настройками
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";

import type {
  UserSettings,
  SettingsResponse,
  UserProfileSettings,
  NotificationSettings,
  InterfaceSettings,
} from "../model/types";

/**
 * Получить все настройки текущего пользователя
 */
export const getAllSettings = async (): Promise<UserSettings> => {
  try {
    const response = await client.get(API_ENDPOINTS.SETTINGS.LIST);
    return response.data;
  } catch (error) {
    console.error("Failed to get all settings:", error);
    throw error;
  }
};

/**
 * Обновить все настройки пользователя
 */
export const updateAllSettings = async (
  settings: Partial<UserSettings>
): Promise<SettingsResponse> => {
  try {
    const response = await client.put(API_ENDPOINTS.SETTINGS.UPDATE_ALL, settings);
    return {
      success: true,
      message: "Настройки успешно обновлены",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to update all settings:", error);
    return {
      success: false,
      message: "Ошибка при обновлении настроек",
    };
  }
};

/**
 * Получить настройки профиля
 */
export const getProfileSettings = async (): Promise<UserProfileSettings> => {
  try {
    const response = await client.get(API_ENDPOINTS.SETTINGS.PROFILE);
    return response.data;
  } catch (error) {
    console.error("Failed to get profile settings:", error);
    throw error;
  }
};

/**
 * Обновить настройки профиля
 */
export const updateProfileSettings = async (
  settings: Partial<UserProfileSettings>
): Promise<SettingsResponse> => {
  try {
    const response = await client.put(API_ENDPOINTS.SETTINGS.UPDATE_PROFILE, settings);
    return {
      success: true,
      message: "Профиль успешно обновлен",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to update profile settings:", error);
    return {
      success: false,
      message: "Ошибка при обновлении профиля",
    };
  }
};

/**
 * Обновить настройки уведомлений
 */
export const updateNotificationSettings = async (
  settings: Partial<NotificationSettings>
): Promise<SettingsResponse> => {
  try {
    const response = await client.put(API_ENDPOINTS.SETTINGS.UPDATE_NOTIFICATIONS, settings);
    return {
      success: true,
      message: "Настройки уведомлений обновлены",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    return {
      success: false,
      message: "Ошибка при обновлении настроек уведомлений",
    };
  }
};

/**
 * Обновить настройки интерфейса
 */
export const updateInterfaceSettings = async (
  settings: Partial<InterfaceSettings>
): Promise<SettingsResponse> => {
  try {
    const response = await client.put(API_ENDPOINTS.SETTINGS.UPDATE_INTERFACE, settings);
    return {
      success: true,
      message: "Настройки интерфейса обновлены",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to update interface settings:", error);
    return {
      success: false,
      message: "Ошибка при обновлении настроек интерфейса",
    };
  }
};

/**
 * Обновить настройки безопасности
 */
export const updateSecuritySettings = async (
  settings: any
): Promise<SettingsResponse> => {
  try {
    const response = await client.put(API_ENDPOINTS.SETTINGS.UPDATE_SECURITY, settings);
    return {
      success: true,
      message: "Настройки безопасности обновлены",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to update security settings:", error);
    return {
      success: false,
      message: "Ошибка при обновлении настроек безопасности",
    };
  }
};

/**
 * Обновить настройки приватности
 */
export const updatePrivacySettings = async (
  settings: any
): Promise<SettingsResponse> => {
  try {
    const response = await client.put(API_ENDPOINTS.SETTINGS.UPDATE_PRIVACY, settings);
    return {
      success: true,
      message: "Настройки приватности обновлены",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to update privacy settings:", error);
    return {
      success: false,
      message: "Ошибка при обновлении настроек приватности",
    };
  }
};

/**
 * Изменить пароль
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<SettingsResponse> => {
  try {
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: "Пароли не совпадают",
      };
    }

    const response = await client.post(API_ENDPOINTS.SETTINGS.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
    });

    return {
      success: true,
      message: "Пароль успешно изменен",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to change password:", error);
    return {
      success: false,
      message: "Ошибка при смене пароля",
    };
  }
};

/**
 * Получить активные сессии
 */
export const getUserSessions = async (): Promise<any[]> => {
  try {
    const response = await client.get(API_ENDPOINTS.SETTINGS.SESSIONS);
    return response.data?.sessions || [];
  } catch (error) {
    console.error("Failed to get user sessions:", error);
    return [];
  }
};

/**
 * Отозвать сессии
 */
export const revokeSessions = async (
  sessionIds?: string[]
): Promise<SettingsResponse> => {
  try {
    const response = await client.post(API_ENDPOINTS.SETTINGS.SESSIONS_REVOKE, {
      session_ids: sessionIds,
    });

    return {
      success: true,
      message: sessionIds
        ? "Выбранные сессии отозваны"
        : "Все сессии отозваны",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to revoke sessions:", error);
    return {
      success: false,
      message: "Ошибка при отзыве сессий",
    };
  }
};

/**
 * Экспорт настроек
 */
export const exportSettings = async (): Promise<any> => {
  try {
    const response = await client.get(API_ENDPOINTS.SETTINGS.EXPORT);
    return response.data;
  } catch (error) {
    console.error("Failed to export settings:", error);
    throw error;
  }
};

/**
 * Импорт настроек
 */
export const importSettings = async (settingsData: any): Promise<SettingsResponse> => {
  try {
    const response = await client.post(API_ENDPOINTS.SETTINGS.IMPORT, settingsData);
    return {
      success: true,
      message: "Настройки успешно импортированы",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to import settings:", error);
    return {
      success: false,
      message: "Ошибка при импорте настроек",
    };
  }
};

/**
 * Сбросить настройки к значениям по умолчанию
 */
export const resetSettings = async (): Promise<SettingsResponse> => {
  try {
    const response = await client.post(API_ENDPOINTS.SETTINGS.RESET);
    return {
      success: true,
      message: "Настройки сброшены к значениям по умолчанию",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to reset settings:", error);
    return {
      success: false,
      message: "Ошибка при сбросе настроек",
    };
  }
};

/**
 * Получить настройки пользователя для администратора
 */
export const getAdminUserSettings = async (userId: string): Promise<UserSettings> => {
  try {
    const response = await client.get(API_ENDPOINTS.SETTINGS.ADMIN_GET(userId));
    return response.data;
  } catch (error) {
    console.error("Failed to get admin user settings:", error);
    throw error;
  }
};

/**
 * Обновить настройки пользователя от имени администратора
 */
export const updateAdminUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>
): Promise<SettingsResponse> => {
  try {
    const response = await client.put(API_ENDPOINTS.SETTINGS.ADMIN_UPDATE(userId), settings);
    return {
      success: true,
      message: "Настройки пользователя обновлены",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to update admin user settings:", error);
    return {
      success: false,
      message: "Ошибка при обновлении настроек пользователя",
    };
  }
};

// Экспортируем DAO объект для обратной совместимости
export const settingsDAO = {
  getAllSettings,
  updateAllSettings,
  getProfileSettings,
  updateProfileSettings,
  updateNotificationSettings,
  updateInterfaceSettings,
  updateSecuritySettings,
  updatePrivacySettings,
  changePassword,
  getUserSessions,
  revokeSessions,
  exportSettings,
  importSettings,
  resetSettings,
  getAdminUserSettings,
  updateAdminUserSettings,
};

// Экспортируем также как SettingsDAO для обратной совместимости
export const SettingsDAO = settingsDAO;
