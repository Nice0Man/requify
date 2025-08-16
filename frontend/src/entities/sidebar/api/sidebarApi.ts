import { API_ENDPOINTS } from "@/shared/api";
import type {
  SidebarPreferencesDTO,
  SidebarUserPreferences,
} from "../model/types";
import {
  mapSidebarPreferencesDTO,
  mapSidebarPreferencesToDTO,
} from "../model/types";

/**
 * DAO для работы с настройками сайдбара
 */
export class SidebarPreferencesDAO {
  /**
   * Получить настройки сайдбара пользователя
   */
  static async getUserPreferences(
    userId: string
  ): Promise<SidebarUserPreferences | null> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.USERS.ME.SETTINGS}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Настройки не найдены
        }
        throw new Error(
          `Failed to fetch sidebar preferences: ${response.statusText}`
        );
      }

      const dto: SidebarPreferencesDTO = await response.json();
      return mapSidebarPreferencesDTO(dto);
    } catch (error) {
      console.error("Error fetching sidebar preferences:", error);
      return null;
    }
  }

  /**
   * Сохранить настройки сайдбара пользователя
   */
  static async saveUserPreferences(
    userId: string,
    preferences: SidebarUserPreferences
  ): Promise<boolean> {
    try {
      const dto = mapSidebarPreferencesToDTO(userId, preferences);

      const response = await fetch(
        `${API_ENDPOINTS.USERS.ME.SETTINGS}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(dto),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to save sidebar preferences: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error saving sidebar preferences:", error);
      return false;
    }
  }

  /**
   * Сбросить настройки сайдбара к значениям по умолчанию
   */
  static async resetUserPreferences(userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.USERS.ME}/sidebar-preferences`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to reset sidebar preferences: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error resetting sidebar preferences:", error);
      return false;
    }
  }
}

/**
 * Хук для работы с настройками сайдбара через React Query
 */
export const sidebarPreferencesQueryKeys = {
  userPreferences: (userId: string) => ["sidebar-preferences", userId] as const,
};
