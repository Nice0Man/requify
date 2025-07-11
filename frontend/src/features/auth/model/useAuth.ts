import { useAuth0 } from "@auth0/auth0-react";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adaptAuth0User, socialProviderMap } from "./auth0.adapter";
import { isAuth0Configured } from "@/app/config/auth0.config";
import { authApi } from "../api/authApi";
import type { LoginFormData, RegisterFormData } from "./types";
import type { User } from "@/shared/types/user";

// Тип для состояния аутентификации
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Универсальный хук для аутентификации - поддерживает Auth0 и стандартную аутентификацию
 */
export const useAuth = () => {
  const auth0Configured = isAuth0Configured();
  const navigate = useNavigate();

  // Состояние для стандартной аутентификации
  const [standardAuthState, setStandardAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Auth0 результат (только если настроен)
  const auth0Result = useAuth0();

  // Инициализация стандартной аутентификации при загрузке
  useEffect(() => {
    if (!auth0Configured) {
      initializeStandardAuth();
    }
  }, [auth0Configured]);

  const initializeStandardAuth = useCallback(async () => {
    try {
      setStandardAuthState((prev) => ({ ...prev, isLoading: true }));

      // Проверяем наличие токена в localStorage
      const token = localStorage.getItem("authToken");
      if (!token) {
        setStandardAuthState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Проверяем валидность токена и получаем пользователя
      try {
        const user = await authApi.getMe();
        setStandardAuthState({
          user: user as unknown as User,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        // Токен невалидный, очищаем
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        setStandardAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Failed to initialize standard auth:", error);
      setStandardAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Ошибка инициализации аутентификации",
      });
    }
  }, []);

  // Стандартные методы аутентификации
  const standardLogin = useCallback(
    async (credentials: LoginFormData) => {
      try {
        setStandardAuthState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        const response = await authApi.login({
          username: credentials.username,
          password: credentials.password,
        });

        // Сохраняем токены (проверяем оба формата для совместимости)
        const accessToken = response.access_token || response.token;
        const refreshToken = response.refresh_token || response.refreshToken;
        
        if (accessToken) {
          localStorage.setItem("authToken", accessToken);
          localStorage.setItem("access_token", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("refresh_token", refreshToken);
        }

        setStandardAuthState({
          user: response.user as unknown as User,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Перенаправляем на dashboard
        navigate("/dashboard");
      } catch (error: any) {
        setStandardAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error.response?.data?.detail ||
            error.message ||
            "Ошибка входа в систему",
        }));
        throw error;
      }
    },
    [navigate]
  );

  const standardRegister = useCallback(
    async (data: RegisterFormData) => {
      try {
        setStandardAuthState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        const response = await authApi.register({
          name:
            data.first_name && data.last_name
              ? `${data.first_name} ${data.last_name}`
              : data.username,
          email: data.email,
          password: data.password,
        });

        // Сохраняем токены (проверяем оба формата для совместимости)
        const accessToken = response.access_token || response.token;
        const refreshToken = response.refresh_token || response.refreshToken;
        
        if (accessToken) {
          localStorage.setItem("authToken", accessToken);
          localStorage.setItem("access_token", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("refresh_token", refreshToken);
        }

        setStandardAuthState({
          user: response.user as unknown as User,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Перенаправляем на dashboard
        navigate("/dashboard");
      } catch (error: any) {
        setStandardAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error.response?.data?.detail ||
            error.message ||
            "Ошибка регистрации",
        }));
        throw error;
      }
    },
    [navigate]
  );

  const standardLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn("Logout API error:", error);
    } finally {
      // Очищаем локальное состояние в любом случае
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      setStandardAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      navigate("/auth");
    }
  }, [navigate]);

  // Auth0 методы аутентификации
  const auth0Login = useCallback(
    async (credentials: LoginFormData) => {
      if (!auth0Configured) {
        throw new Error("Auth0 не настроен");
      }

      return auth0Result.loginWithRedirect({
        authorizationParams: {
          login_hint: credentials.username,
        },
      });
    },
    [auth0Configured, auth0Result]
  );

  const auth0Register = useCallback(
    async (data: RegisterFormData) => {
      if (!auth0Configured) {
        throw new Error("Auth0 не настроен");
      }

      return auth0Result.loginWithRedirect({
        authorizationParams: {
          screen_hint: "signup",
          login_hint: data.email,
        },
      });
    },
    [auth0Configured, auth0Result]
  );

  const auth0Logout = useCallback(async () => {
    if (!auth0Configured) {
      throw new Error("Auth0 не настроен");
    }

    return auth0Result.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [auth0Configured, auth0Result]);

  // Определяем итоговое состояние
  const finalState: AuthState = useMemo(() => {
    if (auth0Configured) {
      // Используем Auth0
      const adaptedUser = auth0Result.user
        ? adaptAuth0User(auth0Result.user)
        : null;
      return {
        isLoading: auth0Result.isLoading,
        isAuthenticated: auth0Result.isAuthenticated,
        user: adaptedUser,
        error: auth0Result.error?.message || null,
      };
    } else {
      // Используем стандартную аутентификацию
      return standardAuthState;
    }
  }, [auth0Configured, auth0Result, standardAuthState]);

  // Социальная аутентификация (только для Auth0)
  const loginWithSocial = useCallback(
    async (provider: keyof typeof socialProviderMap) => {
      if (!auth0Configured) {
        throw new Error("Социальная аутентификация доступна только с Auth0");
      }

      return auth0Result.loginWithRedirect({
        authorizationParams: {
          connection: socialProviderMap[provider],
        },
      });
    },
    [auth0Configured, auth0Result]
  );

  const refreshUser = useCallback(async () => {
    if (auth0Configured) {
      // Auth0 автоматически обновляет пользователя
      return finalState.user;
    } else {
      // Обновляем пользователя через API
      try {
        const user = await authApi.getMe();
        setStandardAuthState((prev) => ({
          ...prev,
          user: user as unknown as User,
        }));
        return user as unknown as User;
      } catch (error) {
        console.error("Failed to refresh user:", error);
        return null;
      }
    }
  }, [auth0Configured, finalState.user]);

  const getAccessToken = useCallback(async () => {
    if (auth0Configured) {
      return auth0Result.getAccessTokenSilently();
    } else {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Токен не найден");
      }
      return token;
    }
  }, [auth0Configured, auth0Result]);

  const clearError = useCallback(() => {
    if (!auth0Configured) {
      setStandardAuthState((prev) => ({ ...prev, error: null }));
    }
  }, [auth0Configured]);

  return {
    // Состояние аутентификации
    ...finalState,
    isInitialized: !finalState.isLoading,

    // Методы аутентификации
    login: auth0Configured ? auth0Login : standardLogin,
    register: auth0Configured ? auth0Register : standardRegister,
    logout: auth0Configured ? auth0Logout : standardLogout,

    // Социальная аутентификация (только Auth0)
    loginWithSocial,

    // Управление пользователем
    refreshUser,
    getAccessToken,
    clearError,

    // Флаги конфигурации
    isAuth0Configured: auth0Configured,
    authMethod: auth0Configured ? "auth0" : "standard",
  };
};
