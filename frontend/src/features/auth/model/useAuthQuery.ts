import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { oauth2API } from "@/shared/api/oauth2";
import type { LoginRequest, RegisterRequest } from "../api/authApi";

export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  sessions: () => [...authKeys.all, "sessions"] as const,
};

/**
 * Query для получения текущего пользователя
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => oauth2API.getCurrentUser(),
    enabled: oauth2API.isAuthenticated(), // Запрашиваем только если аутентифицированы
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
      const response = await oauth2API.login(credentials);
      return response;
    },
    onSuccess: (data) => {
      // Устанавливаем данные пользователя в кэш
      if (data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
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
      const response = await oauth2API.login({
        username: userData.email,
        password: userData.password,
      });
      return response;
    },
    onSuccess: (data) => {
      // Устанавливаем данные пользователя в кэш
      if (data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
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
      await oauth2API.logout();
    },
    onSuccess: () => {
      // Очищаем весь кэш при выходе
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout mutation failed:", error);
      // Очищаем кэш даже при ошибке выхода
      queryClient.clear();
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
      await oauth2API.autoRefreshToken();
    },
    onSuccess: () => {
      // Инвалидируем auth-запросы после обновления токенов
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error("Token refresh mutation failed:", error);
      // При неудачном обновлении токенов очищаем кэш
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
};

/**
 * Query для получения сессий пользователя
 */
export const useUserSessions = () => {
  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => oauth2API.getSessions(),
    enabled: oauth2API.isAuthenticated(),
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
      await oauth2API.revokeSession(sessionIds);
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
  const { data: user, isLoading, error } = useCurrentUser();

  return {
    user,
    isAuthenticated: oauth2API.isAuthenticated() && !!user,
    isLoading,
    error,
    shouldRefresh: oauth2API.shouldRefreshToken(),
    debugInfo: oauth2API.getTokenDebugInfo(),
  };
};

/**
 * Mutation для запроса восстановления пароля
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      // TODO: Implement forgot password API call
      await oauth2API.forgotPassword(email);
      console.log("Forgot password request for:", email);
      throw new Error("Forgot password functionality not implemented yet");
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
