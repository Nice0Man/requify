import { useState, useEffect, useCallback } from "react";
import { oauth2API } from "@/shared/api/oauth2";
import { authApi } from "../api/authApi";
import type { LoginRequest, LoginResponse } from "../api/authApi";

interface UseAuthReturn {
  user: LoginResponse["user"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Проверяем аутентификацию при загрузке
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Используем OAuth2API для проверки аутентификации
      if (oauth2API.isAuthenticated()) {
        const userData = await oauth2API.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
        // Очищаем токены если аутентификация не прошла
        oauth2API.clearTokens();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
      // Очищаем токены при ошибке
      oauth2API.clearTokens();
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

      // Используем OAuth2API для логина
      const response = await oauth2API.login(credentials);
      setUser(response.user || null);
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
      if (response.access_token) {
        // OAuth2API автоматически сохранит токены при логине
        await oauth2API.login({
          username: userData.email || userData.username,
          password: userData.password,
        });

        setUser(response.user || null);
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

      // Используем OAuth2API для выхода
      await oauth2API.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Очищаем состояние даже при ошибке выхода
      setUser(null);
      oauth2API.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!oauth2API.isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      const userData = await oauth2API.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      setError("Failed to refresh user data");
    }
  }, []);

  return {
    user,
    isAuthenticated: oauth2API.isAuthenticated() && !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };
};
