/**
 * Profile Settings API
 */

import { settingsDAO } from "@/entities/user-settings";
import type {
  UserProfileSettings,
  SettingsResponse,
} from "@/entities/user-settings";
import type { ProfileUpdatePayload } from "../model/types";

export class ProfileApi {
  /**
   * Получить настройки профиля
   */
  static async getProfileSettings(): Promise<UserProfileSettings> {
    return await settingsDAO.getProfileSettings();
  }

  /**
   * Обновить настройки профиля
   */
  static async updateProfileSettings(
    payload: ProfileUpdatePayload
  ): Promise<SettingsResponse> {
    const { settings, avatar } = payload;

    try {
      // Сначала загружаем аватар если есть
      if (avatar) {
        const avatarUrl = await this.uploadAvatar(avatar);
        settings.avatar_url = avatarUrl;
      }

      // Обновляем профиль
      return await settingsDAO.updateProfileSettings(settings);
    } catch (error) {
      console.error("Failed to update profile:", error);
      return {
        success: false,
        message: "Ошибка при обновлении профиля",
      };
    }
  }

  /**
   * Загрузить аватар
   */
  static async uploadAvatar(file: File): Promise<string> {
    // TODO: Реализовать загрузку файла
    // Пока возвращаем заглушку
    const formData = new FormData();
    formData.append("avatar", file);

    // В реальном приложении здесь должен быть вызов API для загрузки файла
    return Promise.resolve(`/uploads/avatars/${Date.now()}_${file.name}`);
  }
}
