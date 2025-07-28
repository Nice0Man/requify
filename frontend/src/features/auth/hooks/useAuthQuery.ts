import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
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
 * Query для получения текущего пользователя
 */
export const useCurrentUser = (): UseQueryResult<UserProfile, Error> => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const userProfile = await userDAO.getCurrentUserProfile();
      return userProfile;
    },
    enabled: apiUtils.isAuthenticated(), // Запрашиваем только если аутентифицированы
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
      // Получаем полную информацию о пользователе после логина
      try {
        const userData = await userDAO.getCurrentUserProfile();
        queryClient.setQueryData(authKeys.user(), userData);
      } catch (error) {
        console.warn("Failed to fetch user profile after login:", error);
      }

      // Инвалидируем все auth-запросы для обновления состояния
      queryClient.invalidateQueries({ queryKey: authKeys.all });
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
      // Получаем полную информацию о пользователе после регистрации
      try {
        const userData = await userDAO.getCurrentUserProfile();
        queryClient.setQueryData(authKeys.user(), userData);
      } catch (error) {
        console.warn("Failed to fetch user profile after registration:", error);
      }

      // Инвалидируем все auth-запросы для обновления состояния
      queryClient.invalidateQueries({ queryKey: authKeys.all });
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
    },
    onError: (error) => {
      console.error("Logout mutation failed:", error);
      // Очищаем кэш и токены даже при ошибке выхода
      queryClient.clear();
      apiUtils.tokens.clear();
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
