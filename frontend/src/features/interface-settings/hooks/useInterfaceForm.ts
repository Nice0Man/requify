/**
 * Interface Settings Form Hook
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsDAO } from "@/entities/user-settings";
import type { 
  InterfaceSettingsFormData, 
  InterfaceSettingsState,
} from "../model/types";

const INTERFACE_SETTINGS_QUERY_KEY = ["settings", "interface"];

export const useInterfaceForm = () => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<InterfaceSettingsState>({
    data: {} as InterfaceSettingsFormData,
    isLoading: false,
    isSaving: false,
    errors: {},
    isDirty: false,
  });

  // Загрузка настроек интерфейса
  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: INTERFACE_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const allSettings = await settingsDAO.getAllSettings();
      return allSettings.interface;
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Мутация для обновления настроек интерфейса
  const updateInterfaceMutation = useMutation({
    mutationFn: (settings: Partial<InterfaceSettingsFormData>) =>
      settingsDAO.updateInterfaceSettings(settings),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: INTERFACE_SETTINGS_QUERY_KEY });
      setState(prev => ({ ...prev, isDirty: false, isSaving: false }));
      
      // Применяем настройки интерфейса немедленно
      if (response.data) {
        applyInterfaceSettings(response.data);
      }
    },
    onError: (error) => {
      console.error("Failed to update interface settings:", error);
      setState(prev => ({ ...prev, isSaving: false }));
    },
  });

  // Применение настроек интерфейса к странице
  const applyInterfaceSettings = useCallback((settings: any) => {
    // Применение темы
    if (settings.theme) {
      const root = document.documentElement;
      if (settings.theme === "dark") {
        root.setAttribute("data-theme", "dark");
      } else if (settings.theme === "light") {
        root.setAttribute("data-theme", "light");
      } else {
        // Auto theme - определяем по системным настройкам
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        root.setAttribute("data-theme", mediaQuery.matches ? "dark" : "light");
      }
    }

    // Применение компактного режима
    if (settings.compact_mode !== undefined) {
      document.body.classList.toggle("compact-mode", settings.compact_mode);
    }

    // Применение анимаций
    if (settings.animations_enabled !== undefined) {
      document.body.classList.toggle("no-animations", !settings.animations_enabled);
    }

    // Применение состояния сайдбара
    if (settings.sidebar_collapsed !== undefined) {
      const event = new CustomEvent("sidebar-toggle", { 
        detail: { collapsed: settings.sidebar_collapsed } 
      });
      window.dispatchEvent(event);
    }
  }, []);

  // Синхронизация с данными из API
  useEffect(() => {
    if (settingsData) {
      setState(prev => ({
        ...prev,
        data: { ...settingsData, _hasChanges: false },
        isLoading: false,
      }));
      
      // Применяем настройки при загрузке
      applyInterfaceSettings(settingsData);
    }
  }, [settingsData, applyInterfaceSettings]);

  // Обновление поля настроек
  const updateSetting = useCallback((key: string, value: any) => {
    setState(prev => {
      const newData = { ...prev.data, [key]: value, _hasChanges: true };
      
      // Применяем изменения немедленно для некоторых настроек
      if (key === "theme" || key === "compact_mode" || key === "animations_enabled") {
        applyInterfaceSettings({ [key]: value });
      }
      
      return {
        ...prev,
        data: newData,
        isDirty: true,
        errors: { ...prev.errors, [key]: "" }, // Очищаем ошибку для поля
      };
    });
  }, [applyInterfaceSettings]);

  // Сохранение настроек
  const saveSettings = useCallback(async () => {
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const { _hasChanges, ...settingsToSave } = state.data;
      const result = await updateInterfaceMutation.mutateAsync(settingsToSave);
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      throw error;
    }
  }, [state.data, updateInterfaceMutation]);

  // Сброс к значениям по умолчанию
  const resetToDefaults = useCallback(async () => {
    const defaultSettings = {
      theme: "auto" as const,
      language: "ru",
      timezone: "Europe/Moscow",
      date_format: "DD.MM.YYYY",
      time_format: "24h" as const,
      compact_mode: false,
      sidebar_collapsed: false,
      show_hints: true,
      animations_enabled: true,
      items_per_page: 20,
      default_view: "list" as const,
      auto_save: true,
      keyboard_shortcuts: true,
    };

    setState(prev => ({
      ...prev,
      data: { ...defaultSettings, _hasChanges: true },
      isDirty: true,
    }));

    // Применяем настройки по умолчанию
    applyInterfaceSettings(defaultSettings);
  }, [applyInterfaceSettings]);

  // Переключение темы
  const toggleTheme = useCallback(() => {
    const currentTheme = state.data.theme || "auto";
    const nextTheme = currentTheme === "light" ? "dark" : currentTheme === "dark" ? "auto" : "light";
    updateSetting("theme", nextTheme);
  }, [state.data.theme, updateSetting]);

  // Переключение компактного режима
  const toggleCompactMode = useCallback(() => {
    updateSetting("compact_mode", !state.data.compact_mode);
  }, [state.data.compact_mode, updateSetting]);

  // Переключение сайдбара
  const toggleSidebar = useCallback(() => {
    updateSetting("sidebar_collapsed", !state.data.sidebar_collapsed);
  }, [state.data.sidebar_collapsed, updateSetting]);

  return {
    // Состояние
    data: state.data,
    isLoading: isLoadingSettings || state.isLoading,
    isSaving: state.isSaving || updateInterfaceMutation.isPending,
    errors: state.errors,
    isDirty: state.isDirty,

    // Действия
    updateSetting,
    saveSettings,
    resetToDefaults,
    
    // Специфичные действия
    toggleTheme,
    toggleCompactMode,
    toggleSidebar,
    applyInterfaceSettings,

    // Мутация для прямого доступа
    updateInterfaceMutation,
  };
}; 