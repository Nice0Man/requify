import { useState, useEffect, useCallback } from "react";
// Features API (согласно FSD)
import { authApi } from "../api/authApi";
import type { LoginRequest } from "../api/authApi";
// App Layer (провайдеры разрешены в features)
import { apiUtils } from "@/app/providers/client";
// Entities (разрешено в features)
import { userDAO } from "@/entities/user/api/userDAO";
import type { UserProfile } from "@/entities/user/model/types";

interface UseAuthReturn {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginWithSocial: (provider: string) => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Проверяем аутентификацию при загрузке
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Используем apiUtils для проверки аутентификации
      if (apiUtils.isAuthenticated()) {
        const userData = await userDAO.getCurrentUserProfile();
        setUser(userData);
      } else {
        setUser(null);
        // Очищаем токены если аутентификация не прошла
        apiUtils.tokens.clear();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
      // Очищаем токены при ошибке
      apiUtils.tokens.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      // Используем authApi для логина
      const response = await authApi.login(credentials);

      // Сохраняем токены
      if (response.access_token && response.refresh_token) {
        apiUtils.tokens.save(response.access_token, response.refresh_token);

        // Получаем полную информацию о пользователе
        const userData = await userDAO.getCurrentUserProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Регистрация через API
      const response = await authApi.register(userData);

      // Автоматический логин после регистрации
      if (response.access_token && response.refresh_token) {
        // Сохраняем токены
        apiUtils.tokens.save(response.access_token, response.refresh_token);

        // Получаем полную информацию о пользователе
        const fullUserData = await userDAO.getCurrentUserProfile();
        setUser(fullUserData);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error instanceof Error ? error.message : "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Используем authApi для выхода
      await authApi.logout();
      setUser(null);
      apiUtils.tokens.clear();
    } catch (error) {
      console.error("Logout failed:", error);
      // Очищаем состояние даже при ошибке выхода
      setUser(null);
      apiUtils.tokens.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!apiUtils.isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      const userData = await userDAO.getCurrentUserProfile();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      setError("Failed to refresh user data");
    }
  }, []);

  const loginWithSocial = useCallback(async (provider: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Реализовать social login через authApi
      console.warn("Social login not implemented yet for provider:", provider);
      throw new Error(`Social login with ${provider} is not implemented yet`);
    } catch (error) {
      console.error("Failed to login with social:", error);
      setError(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated: apiUtils.isAuthenticated() && !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    loginWithSocial,
  };
};
