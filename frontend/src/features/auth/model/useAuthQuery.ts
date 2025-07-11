import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";

// Query Keys
export const authQueryKeys = {
  currentUser: ["auth", "currentUser"] as const,
  profile: ["auth", "profile"] as const,
  auth0Status: ["auth", "auth0", "status"] as const,
};

// Queries
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authQueryKeys.currentUser,
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 минут
    gcTime: 60 * 60 * 1000, // 1 час
  });
};

export const useAuth0Status = () => {
  return useQuery({
    queryKey: authQueryKeys.auth0Status,
    queryFn: authApi.getAuth0Status,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
};

// Mutations
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Сохраняем токены (проверяем оба формата для совместимости)
      const accessToken = data.access_token || data.token;
      const refreshToken = data.refresh_token || data.refreshToken;
      
      if (accessToken) {
        localStorage.setItem("authToken", accessToken);
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("refresh_token", refreshToken);
      }

      // Обновляем кэш пользователя
      queryClient.setQueryData(authQueryKeys.currentUser, data.user);

      // Инвалидируем связанные запросы
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Сохраняем токены (проверяем оба формата для совместимости)
      const accessToken = data.access_token || data.token;
      const refreshToken = data.refresh_token || data.refreshToken;
      
      if (accessToken) {
        localStorage.setItem("authToken", accessToken);
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("refresh_token", refreshToken);
      }

      // Обновляем кэш пользователя
      queryClient.setQueryData(authQueryKeys.currentUser, data.user);

      // Инвалидируем связанные запросы
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: (error) => {
      console.error("Register error:", error);
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Удаляем токены из localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");

      // Очищаем кэш
      queryClient.clear();

      // Перенаправляем на страницу авторизации
      window.location.href = "/auth";
    },
    onError: (error) => {
      console.error("Logout error:", error);
      // Даже при ошибке очищаем локальные данные
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      queryClient.clear();
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      // Показываем уведомление об успешной отправке
      console.log("Password reset email sent");
    },
    onError: (error) => {
      console.error("Forgot password error:", error);
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      // Показываем уведомление об успешном сбросе пароля
      console.log("Password reset successfully");
    },
    onError: (error) => {
      console.error("Reset password error:", error);
    },
  });
};
