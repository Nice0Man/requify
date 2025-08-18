/**
 * Hook for managing notification settings
 */

import { useState, useEffect, useCallback } from "react";
import { settingsDAO } from "@/entities/user-settings";
import type {
  NotificationFormData,
  NotificationFormState,
  UseNotificationFormReturn,
} from "../model/types";
import type { NotificationSettings } from "@/entities/user-settings";

const initialFormData: NotificationFormData = {
  email_notifications: true,
  push_notifications: true,
  project_updates: true,
  requirement_changes: true,
  release_notifications: true,
  team_invitations: true,
  system_notifications: false,
  weekly_digest: true,
  mention_notifications: true,
};

export const useNotificationForm = (): UseNotificationFormReturn => {
  const [state, setState] = useState<NotificationFormState>({
    data: initialFormData,
    isLoading: true,
    isSaving: false,
    isDirty: false,
  });

  // Загрузка настроек
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const allSettings = await settingsDAO.getAllSettings();
        setState(prev => ({
          ...prev,
          data: { ...allSettings.notifications },
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to load notification settings:", error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "Не удалось загрузить настройки уведомлений",
        }));
      }
    };

    loadSettings();
  }, []);

  // Обновление настройки
  const updateSetting = useCallback((key: keyof NotificationSettings, value: boolean) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [key]: value },
      isDirty: true,
    }));
  }, []);

  // Сохранение настроек
  const saveSettings = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isSaving: true }));
      
      const result = await settingsDAO.updateNotificationSettings(state.data);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        isDirty: !result.success,
        error: result.success ? undefined : result.message,
      }));

      return result;
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        error: "Ошибка при сохранении настроек",
      }));
      return { success: false, message: "Ошибка при сохранении" };
    }
  }, [state.data]);

  // Сброс формы
  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDirty: false,
      error: undefined,
    }));
  }, []);

  // Включить все уведомления
  const enableAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        email_notifications: true,
        push_notifications: true,
        project_updates: true,
        requirement_changes: true,
        release_notifications: true,
        team_invitations: true,
        system_notifications: true,
        weekly_digest: true,
        mention_notifications: true,
      },
      isDirty: true,
    }));
  }, []);

  // Отключить все уведомления
  const disableAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        email_notifications: false,
        push_notifications: false,
        project_updates: false,
        requirement_changes: false,
        release_notifications: false,
        team_invitations: false,
        system_notifications: false,
        weekly_digest: false,
        mention_notifications: false,
      },
      isDirty: true,
    }));
  }, []);

  return {
    ...state,
    updateSetting,
    saveSettings,
    resetForm,
    enableAll,
    disableAll,
  };
}; 