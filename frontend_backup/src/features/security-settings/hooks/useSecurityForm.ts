/**
 * Security Settings Form Hook
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsDAO } from "@/entities/user-settings";
import type { 
  SecuritySettingsFormData, 
  SecuritySettingsState,
  PasswordChangeFormData} from "../model/types";

const SECURITY_SETTINGS_QUERY_KEY = ["settings", "security"];
const SESSIONS_QUERY_KEY = ["settings", "sessions"];

export const useSecurityForm = () => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SecuritySettingsState>({
    data: {} as SecuritySettingsFormData,
    isLoading: false,
    isSaving: false,
    errors: {},
    isDirty: false,
  });

  // Загрузка настроек безопасности
  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: SECURITY_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const allSettings = await settingsDAO.getAllSettings();
      return allSettings.security;
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Загрузка активных сессий
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: () => settingsDAO.getUserSessions(),
    staleTime: 60 * 1000, // 1 минута
  });

  // Мутация для обновления настроек безопасности
  const updateSecurityMutation = useMutation({
    mutationFn: (settings: Partial<SecuritySettingsFormData>) =>
      settingsDAO.updateSecuritySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECURITY_SETTINGS_QUERY_KEY });
      setState(prev => ({ ...prev, isDirty: false, isSaving: false }));
    },
    onError: (error) => {
      console.error("Failed to update security settings:", error);
      setState(prev => ({ ...prev, isSaving: false }));
    },
  });

  // Мутация для смены пароля
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordChangeFormData) =>
      settingsDAO.changePassword(data.currentPassword, data.newPassword, data.confirmPassword),
    onSuccess: () => {
      // Пароль изменен успешно
    },
    onError: (error) => {
      console.error("Failed to change password:", error);
    },
  });

  // Мутация для отзыва сессий
  const revokeSessionsMutation = useMutation({
    mutationFn: (sessionIds?: string[]) => settingsDAO.revokeSessions(sessionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to revoke sessions:", error);
    },
  });

  // Синхронизация с данными из API
  useEffect(() => {
    if (settingsData) {
      setState(prev => ({
        ...prev,
        data: { ...settingsData, _hasChanges: false },
        isLoading: false,
      }));
    }
  }, [settingsData]);

  // Обновление поля настроек
  const updateSetting = useCallback((key: string, value: any) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [key]: value, _hasChanges: true },
      isDirty: true,
      errors: { ...prev.errors, [key]: "" }, // Очищаем ошибку для поля
    }));
  }, []);

  // Сохранение настроек
  const saveSettings = useCallback(async () => {
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const { _hasChanges, ...settingsToSave } = state.data;
      const result = await updateSecurityMutation.mutateAsync(settingsToSave);
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      throw error;
    }
  }, [state.data, updateSecurityMutation]);

  // Смена пароля
  const changePassword = useCallback(async (data: PasswordChangeFormData) => {
    return await changePasswordMutation.mutateAsync(data);
  }, [changePasswordMutation]);

  // Отзыв сессий
  const revokeSessions = useCallback(async (sessionIds?: string[]) => {
    return await revokeSessionsMutation.mutateAsync(sessionIds);
  }, [revokeSessionsMutation]);

  // Отзыв всех сессий кроме текущей
  const revokeAllOtherSessions = useCallback(async () => {
    const otherSessions = sessions.filter(s => !s.is_current).map(s => s.id);
    if (otherSessions.length > 0) {
      return await revokeSessions(otherSessions);
    }
  }, [sessions, revokeSessions]);

  return {
    // Состояние
    data: state.data,
    sessions,
    isLoading: isLoadingSettings || isLoadingSessions || state.isLoading,
    isSaving: state.isSaving || updateSecurityMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isRevokingSessions: revokeSessionsMutation.isPending,
    errors: state.errors,
    isDirty: state.isDirty,

    // Действия
    updateSetting,
    saveSettings,
    changePassword,
    revokeSessions,
    revokeAllOtherSessions,

    // Мутации для прямого доступа
    updateSecurityMutation,
    changePasswordMutation,
    revokeSessionsMutation,
  };
}; 