import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useState, useEffect } from "react";
// Features API (согласно FSD)
import { authApi } from "../api/authApi";
import type { LoginRequest, RegisterRequest } from "../api/authApi";
// App Layer (провайдеры разрешены в features)
import { apiUtils } from "@/app/providers/client";
// Entities (разрешено в features)
import { userDAO } from "@/entities/user/api/userDAO";
import { User, UserProfile } from "@/entities/user/model/types";

export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  sessions: () => [...authKeys.all, "sessions"] as const,
};

/**
 * Хук для реактивного отслеживания состояния аутентификации
 */
const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    apiUtils.isAuthenticated()
  );

  useEffect(() => {
    // Проверяем состояние аутентификации каждые 30 секунд
    const interval = setInterval(() => {
      const currentAuthState = apiUtils.isAuthenticated();
      if (currentAuthState !== isAuthenticated) {
        setIsAuthenticated(currentAuthState);
      }
    }, 30000);

    // Проверяем при фокусе окна
    const handleFocus = () => {
      const currentAuthState = apiUtils.isAuthenticated();
      if (currentAuthState !== isAuthenticated) {
        setIsAuthenticated(currentAuthState);
      }
    };

    // Слушаем изменения в localStorage (для случаев логина в другой вкладке)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'token_expires_at') {
        const currentAuthState = apiUtils.isAuthenticated();
        setIsAuthenticated(currentAuthState);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

  return isAuthenticated;
};

/**
 * Query для получения текущего пользователя
 */
export const useCurrentUser = (): UseQueryResult<UserProfile, Error> => {
  const isAuthenticated = useAuthState();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const userProfile = await userDAO.getCurrentUserProfile();
      return userProfile;
    },
    enabled: isAuthenticated, // Теперь реактивно отслеживается
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: (failureCount, error: any) => {
      // Не повторяем запрос если проблема с аутентификацией
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Mutation для логина
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await authApi.login(credentials);

      // Сохраняем токены
      if (response.access_token && response.refresh_token) {
        apiUtils.tokens.save(response.access_token, response.refresh_token);
      }

      return response;
    },
    onSuccess: async (data) => {
      // Принудительно обновляем состояние аутентификации
      // Это заставит useAuthState() перезапустить useCurrentUser
      
      // Сначала инвалидируем кэш
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      // Получаем полную информацию о пользователе после логина
      try {
        const userData = await userDAO.getCurrentUserProfile();
        queryClient.setQueryData(authKeys.user(), userData);
        
        // Форсируем обновление всех компонентов, использующих эти данные
        queryClient.refetchQueries({ queryKey: authKeys.user() });
      } catch (error) {
        console.warn("Failed to fetch user profile after login:", error);
        // Если не удалось получить профиль, все равно инвалидируем для повторной попытки
        queryClient.invalidateQueries({ queryKey: authKeys.user() });
      }

      // Инвалидируем все auth-запросы для обновления состояния
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      // Принудительно уведомляем об изменении localStorage для useAuthState
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'access_token',
        newValue: data.access_token,
        storageArea: localStorage
      }));
    },
    onError: (error) => {
      console.error("Login mutation failed:", error);
      // Очищаем auth кэш при ошибке логина
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
};

/**
 * Mutation для регистрации
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      const response = await authApi.register(userData);

      // Сохраняем токены
      if (response.access_token && response.refresh_token) {
        apiUtils.tokens.save(response.access_token, response.refresh_token);
      }

      return response;
    },
    onSuccess: async (data) => {
      // Принудительно обновляем состояние аутентификации
      // Сначала инвалидируем кэш
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      // Получаем полную информацию о пользователе после регистрации
      try {
        const userData = await userDAO.getCurrentUserProfile();
        queryClient.setQueryData(authKeys.user(), userData);
        
        // Форсируем обновление всех компонентов
        queryClient.refetchQueries({ queryKey: authKeys.user() });
      } catch (error) {
        console.warn("Failed to fetch user profile after registration:", error);
        // Если не удалось получить профиль, все равно инвалидируем
        queryClient.invalidateQueries({ queryKey: authKeys.user() });
      }

      // Инвалидируем все auth-запросы для обновления состояния
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      // Принудительно уведомляем об изменении localStorage для useAuthState
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'access_token',
        newValue: data.access_token,
        storageArea: localStorage
      }));
    },
    onError: (error) => {
      console.error("Registration mutation failed:", error);
      // Очищаем auth кэш при ошибке регистрации
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
};

/**
 * Mutation для выхода
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
      // Очищаем токены
      apiUtils.tokens.clear();
    },
    onSuccess: () => {
      // Очищаем весь кэш при выходе
      queryClient.clear();
      
      // Принудительно уведомляем об изменении localStorage для useAuthState
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'access_token',
        newValue: null,
        storageArea: localStorage
      }));
    },
    onError: (error) => {
      console.error("Logout mutation failed:", error);
      // Очищаем кэш и токены даже при ошибке выхода
      queryClient.clear();
      apiUtils.tokens.clear();
      
      // Уведомляем об очистке даже при ошибке
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'access_token',
        newValue: null,
        storageArea: localStorage
      }));
    },
  });
};

/**
 * Mutation для обновления токенов
 */
export const useRefreshTokens = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = apiUtils.tokens.getRefresh();
      if (refreshToken) {
        const response = await authApi.refreshToken({ refreshToken });
        if (response.access_token && response.refresh_token) {
          apiUtils.tokens.save(response.access_token, response.refresh_token);
        }
      } else {
        throw new Error("No refresh token available");
      }
    },
    onSuccess: () => {
      // Инвалидируем auth-запросы после обновления токенов
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      // Уведомляем useAuthState об обновлении токена
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'access_token',
        newValue: apiUtils.tokens.get(),
        storageArea: localStorage
      }));
    },
    onError: (error) => {
      console.error("Token refresh mutation failed:", error);
      // При неудачном обновлении токенов очищаем кэш и токены
      queryClient.removeQueries({ queryKey: authKeys.all });
      apiUtils.tokens.clear();
    },
  });
};

/**
 * Query для получения сессий пользователя
 */
export const useUserSessions = () => {
  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: async () => {
      // TODO: Реализовать получение сессий через authApi
      console.warn("getSessions not implemented in authApi");
      return [];
    },
    enabled: apiUtils.isAuthenticated(),
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

/**
 * Mutation для отзыва сессий
 */
export const useRevokeSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionIds?: string[]) => {
      // TODO: Реализовать отзыв сессий через authApi
      console.warn("revokeSession not implemented in authApi", sessionIds);
    },
    onSuccess: () => {
      // Обновляем список сессий
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
    },
  });
};

/**
 * Хук для проверки статуса аутентификации
 */
export const useAuthStatus = () => {
  const {
    data: user,
    isLoading,
    error,
  } = useCurrentUser() as UseQueryResult<User, Error>;

  return {
    user,
    isAuthenticated: apiUtils.isAuthenticated() && !!user,
    isLoading,
    error,
    shouldRefresh: apiUtils.tokens.shouldRefresh(),
    debugInfo: {
      hasToken: !!apiUtils.tokens.get(),
      hasRefreshToken: !!apiUtils.tokens.getRefresh(),
    },
  };
};

/**
 * Mutation для запроса восстановления пароля
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      try {
        await authApi.resetPassword({ email });
        console.log("Forgot password request sent for:", email);
      } catch (error) {
        console.error("Forgot password API call failed:", error);
        throw error;
      }
    },
    onError: (error) => {
      console.error("Forgot password mutation failed:", error);
    },
  });
};

/**
 * Mutation для сброса пароля
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      // TODO: Implement reset password API call
      console.log("Reset password request with token:", data.token);
      throw new Error("Reset password functionality not implemented yet");
    },
    onError: (error) => {
      console.error("Reset password mutation failed:", error);
    },
  });
};
