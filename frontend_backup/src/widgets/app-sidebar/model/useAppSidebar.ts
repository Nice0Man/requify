import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/entities/user";
import type { SidebarUserPreferences } from "@/entities/sidebar";
import {
  SidebarPreferencesDAO,
  sidebarPreferencesQueryKeys,
} from "@/entities/sidebar";

export interface AppSidebarState {
  isCollapsed: boolean;
  preferences: SidebarUserPreferences | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseAppSidebarReturn {
  state: AppSidebarState;
  actions: {
    toggleCollapse: () => void;
    setCollapsed: (collapsed: boolean) => void;
    updatePreferences: (
      preferences: Partial<SidebarUserPreferences>
    ) => Promise<boolean>;
    resetPreferences: () => Promise<boolean>;
  };
}

/**
 * Хук для управления состоянием app-sidebar [[memory:2403939]]
 * Использует React Query для работы с пользовательскими настройками
 */
export const useAppSidebar = (
  user?: User,
  defaultCollapsed: boolean = true
): UseAppSidebarReturn => {
  const queryClient = useQueryClient();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Преобразуем user.id в строку для совместимости с API
  const userId = user?.id ? String(user.id) : "";

  // Загрузка настроек пользователя
  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery({
    queryKey: sidebarPreferencesQueryKeys.userPreferences(userId),
    queryFn: () =>
      userId ? SidebarPreferencesDAO.getUserPreferences(userId) : null,
    enabled: !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Обновление настроек
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<SidebarUserPreferences>) => {
      if (!userId) throw new Error("User not found");

      const currentPreferences = preferences || {
        itemOrder: [],
        hiddenItems: [],
        pinnedItems: [],
        isCollapsed: defaultCollapsed,
        expandedGroups: [],
      };

      const updatedPreferences = {
        ...currentPreferences,
        ...newPreferences,
      };

      const success = await SidebarPreferencesDAO.saveUserPreferences(
        userId,
        updatedPreferences
      );

      if (!success) {
        throw new Error("Failed to save preferences");
      }

      return updatedPreferences;
    },
    onSuccess: (updatedPreferences) => {
      // Обновляем кеш
      queryClient.setQueryData(
        sidebarPreferencesQueryKeys.userPreferences(userId),
        updatedPreferences
      );
    },
    onError: (error) => {
      console.error("Failed to update sidebar preferences:", error);
    },
  });

  // Сброс настроек
  const resetPreferencesMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not found");

      const success = await SidebarPreferencesDAO.resetUserPreferences(userId);

      if (!success) {
        throw new Error("Failed to reset preferences");
      }

      return true;
    },
    onSuccess: () => {
      // Очищаем кеш чтобы загрузить настройки по умолчанию
      queryClient.removeQueries({
        queryKey: sidebarPreferencesQueryKeys.userPreferences(userId),
      });

      // Сбрасываем локальное состояние
      setIsCollapsed(defaultCollapsed);
    },
    onError: (error) => {
      console.error("Failed to reset sidebar preferences:", error);
    },
  });

  // Синхронизация с загруженными настройками
  useEffect(() => {
    if (preferences?.isCollapsed !== undefined) {
      setIsCollapsed(preferences.isCollapsed);
    }
  }, [preferences?.isCollapsed]);

  // Переключение состояния сворачивания
  const toggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);

    // Сохраняем в настройках пользователя
    updatePreferencesMutation.mutate({ isCollapsed: newCollapsed });
  }, [isCollapsed, updatePreferencesMutation]);

  // Установка конкретного состояния сворачивания
  const setCollapsed = useCallback(
    (collapsed: boolean) => {
      if (collapsed !== isCollapsed) {
        setIsCollapsed(collapsed);
        updatePreferencesMutation.mutate({ isCollapsed: collapsed });
      }
    },
    [isCollapsed, updatePreferencesMutation]
  );

  // Обновление настроек
  const updatePreferences = useCallback(
    async (
      newPreferences: Partial<SidebarUserPreferences>
    ): Promise<boolean> => {
      try {
        await updatePreferencesMutation.mutateAsync(newPreferences);
        return true;
      } catch (error) {
        console.error("Error updating preferences:", error);
        return false;
      }
    },
    [updatePreferencesMutation]
  );

  // Сброс настроек
  const resetPreferences = useCallback(async (): Promise<boolean> => {
    try {
      await resetPreferencesMutation.mutateAsync();
      return true;
    } catch (error) {
      console.error("Error resetting preferences:", error);
      return false;
    }
  }, [resetPreferencesMutation]);

  return {
    state: {
      isCollapsed,
      preferences: preferences || null,
      isLoading,
      error: error?.message || updatePreferencesMutation.error?.message || null,
    },
    actions: {
      toggleCollapse,
      setCollapsed,
      updatePreferences,
      resetPreferences,
    },
  };
};
