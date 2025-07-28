/**
 * Hook for managing profile form state and actions
 */

import { useState, useEffect, useCallback } from "react";
import { ProfileApi } from "../api/profileApi";
import { validateProfileSettings } from "@/entities/settings";
import type {
  ProfileFormData,
  ProfileFormState,
  ProfileUpdatePayload,
  UseProfileFormReturn,
} from "../model/types";
import type { UserProfileSettings } from "@/entities/settings";

const initialFormData: ProfileFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  bio: "",
  avatar_url: "",
  timezone: "Europe/Moscow",
};

export const useProfileForm = (): UseProfileFormReturn => {
  const [state, setState] = useState<ProfileFormState>({
    data: initialFormData,
    isLoading: true,
    isSaving: false,
    errors: {},
    isValid: false,
    isDirty: false,
  });

  // Загрузка данных профиля
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const profileData = await ProfileApi.getProfileSettings();
        setState(prev => ({
          ...prev,
          data: { ...profileData },
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to load profile:", error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          errors: { general: "Не удалось загрузить данные профиля" },
        }));
      }
    };

    loadProfile();
  }, []);

  // Валидация формы
  const validateForm = useCallback((): boolean => {
    const validation = validateProfileSettings(state.data);
    
    const fieldErrors: Record<string, string> = {};
    validation.errors.forEach(error => {
      fieldErrors[error.field] = error.message;
    });

    setState(prev => ({
      ...prev,
      errors: fieldErrors,
      isValid: validation.isValid,
    }));

    return validation.isValid;
  }, [state.data]);

  // Обновление поля
  const updateField = useCallback((field: keyof UserProfileSettings, value: string) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
    }));
  }, []);

  // Загрузка аватара
  const uploadAvatar = useCallback(async (file: File): Promise<void> => {
    try {
      const avatarUrl = await ProfileApi.uploadAvatar(file);
      updateField("avatar_url", avatarUrl);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, avatar: "Ошибка при загрузке аватара" },
      }));
    }
  }, [updateField]);

  // Сохранение профиля
  const saveProfile = useCallback(async () => {
    if (!validateForm()) {
      return { success: false, message: "Проверьте заполнение формы" };
    }

    try {
      setState(prev => ({ ...prev, isSaving: true }));

      const payload: ProfileUpdatePayload = {
        settings: state.data,
      };

      const result = await ProfileApi.updateProfileSettings(payload);

      setState(prev => ({
        ...prev,
        isSaving: false,
        isDirty: !result.success,
      }));

      return result;
    } catch (error) {
      console.error("Failed to save profile:", error);
      setState(prev => ({ ...prev, isSaving: false }));
      return { success: false, message: "Ошибка при сохранении" };
    }
  }, [state.data, validateForm]);

  // Сброс формы
  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDirty: false,
      errors: {},
    }));
  }, []);

  return {
    ...state,
    updateField,
    uploadAvatar,
    saveProfile,
    resetForm,
    validateForm,
  };
}; 