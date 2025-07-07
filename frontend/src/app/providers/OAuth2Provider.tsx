/**
 * OAuth2Provider - провайдер для автоматического управления OAuth2 токенами
 * Обеспечивает автоматическое обновление токенов и обработку ошибок аутентификации
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { client, oauth2API } from "@/shared/api";
import { UserProfile } from "@/shared/types/auth";
import axios from "axios";

interface OAuth2ContextType {
  isTokenValid: boolean;
  refreshInProgress: boolean;
  lastRefreshTime: number | null;
  forceRefresh: () => Promise<void>;
  clearTokens: () => void;
  refreshUser: () => Promise<void>;
}

const OAuth2Context = createContext<OAuth2ContextType | undefined>(undefined);

interface OAuth2ProviderProps {
  children: React.ReactNode;
  /**
   * Интервал проверки токенов в миллисекундах
   * @default 60000 (1 минута)
   */
  checkInterval?: number;
  /**
   * Время до истечения токена для автоматического обновления в миллисекундах
   * @default 300000 (5 минут)
   */
  refreshBeforeExpiry?: number;
  /**
   * Функция вызываемая при ошибке аутентификации
   */
  onAuthError?: (error: Error) => void;
  /**
   * Функция вызываемая при успешном обновлении токена
   */
  onTokenRefreshed?: () => void;
}

export const OAuth2Provider: React.FC<OAuth2ProviderProps> = ({
  children,
  checkInterval = 60000, // 1 минута
  refreshBeforeExpiry = 300000, // 5 минут
  onAuthError,
  onTokenRefreshed,
}) => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [refreshInProgress, setRefreshInProgress] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Проверка валидности токена
  const checkTokenValidity = useCallback(() => {
    const isValid = oauth2API.isAuthenticated();
    setIsTokenValid(isValid);
    return isValid;
  }, []);

  // Принудительное обновление токена
  const forceRefresh = useCallback(async () => {
    if (refreshInProgress) {
      return; // Уже обновляется
    }

    try {
      setRefreshInProgress(true);
      await oauth2API.autoRefreshToken();
      setLastRefreshTime(Date.now());
      setIsTokenValid(true);
      onTokenRefreshed?.();
    } catch (error) {
      console.error("Failed to refresh token:", error);
      setIsTokenValid(false);
      oauth2API.clearTokens();
      onAuthError?.(error as Error);
    } finally {
      setRefreshInProgress(false);
    }
  }, [refreshInProgress, onAuthError, onTokenRefreshed]);

  // Очистка токенов
  const clearTokens = useCallback(() => {
    oauth2API.clearTokens();
    setIsTokenValid(false);
    setLastRefreshTime(null);
  }, []);

  // Обновление информации о пользователе
  const refreshUser = useCallback(async () => {
    try {
      const response = await client.get<UserProfile>("/users/me");
      console.log("User data refreshed:", response.data);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      throw error;
    }
  }, []);

  // Планирование обновления токена
  const scheduleTokenRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return;

    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const timeUntilRefresh = Math.max(
      0,
      expiryTime - now - refreshBeforeExpiry
    );

    if (timeUntilRefresh > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        forceRefresh();
      }, timeUntilRefresh);
    } else {
      // Токен скоро истечет или уже истек
      forceRefresh();
    }
  }, [refreshBeforeExpiry, forceRefresh]);

  // Основная функция проверки и обновления токенов
  const checkAndRefreshTokens = useCallback(async () => {
    // Проверяем валидность токена
    const isValid = checkTokenValidity();

    if (!isValid) {
      return;
    }

    // Проверяем нужно ли обновить токен
    if (oauth2API.shouldRefreshToken() && !refreshInProgress) {
      await forceRefresh();
    } else {
      // Планируем следующее обновление
      scheduleTokenRefresh();
    }
  }, [
    checkTokenValidity,
    forceRefresh,
    refreshInProgress,
    scheduleTokenRefresh,
  ]);

  // Инициализация провайдера
  useEffect(() => {
    // Первоначальная проверка
    checkAndRefreshTokens();

    // Настройка интервала проверки
    intervalRef.current = setInterval(checkAndRefreshTokens, checkInterval);

    // Слушаем события storage для синхронизации между вкладками
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "access_token" ||
        e.key === "refresh_token" ||
        e.key === "token_expires_at"
      ) {
        checkTokenValidity();
        if (e.newValue) {
          scheduleTokenRefresh();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Слушаем события фокуса для проверки токенов при возвращении на страницу
    const handleFocus = () => {
      checkAndRefreshTokens();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [
    checkAndRefreshTokens,
    checkInterval,
    scheduleTokenRefresh,
    checkTokenValidity,
  ]);

  // Обновление планирования при изменении времени последнего обновления
  useEffect(() => {
    if (lastRefreshTime && isTokenValid) {
      scheduleTokenRefresh();
    }
  }, [lastRefreshTime, isTokenValid, scheduleTokenRefresh]);

  const contextValue: OAuth2ContextType = {
    isTokenValid,
    refreshInProgress,
    lastRefreshTime,
    forceRefresh,
    clearTokens,
    refreshUser,
  };

  return (
    <OAuth2Context.Provider value={contextValue}>
      {children}
    </OAuth2Context.Provider>
  );
};

/**
 * Hook для использования OAuth2 контекста
 */
export const useOAuth2 = (): OAuth2ContextType => {
  const context = useContext(OAuth2Context);
  if (!context) {
    throw new Error("useOAuth2 must be used within an OAuth2Provider");
  }
  return context;
};

/**
 * HOC для компонентов, требующих аутентификации
 */
export const withOAuth2 = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isTokenValid } = useOAuth2();

    if (!isTokenValid) {
      return null; // Или компонент загрузки
    }

    return <Component {...props} />;
  };
};

/**
 * Утилита для создания HTTP интерсептора с автоматическим обновлением токенов
 */
export const createOAuth2Interceptor = () => {
  return {
    // Интерсептор запросов - добавляет токен к заголовкам
    request: (config: any) => {
      const token = oauth2API.getAccessToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },

    // Интерсептор ответов - обрабатывает ошибки аутентификации
    response: {
      success: (response: any) => response,
      error: async (error: any) => {
        const originalRequest = error.config;

        // Если ошибка 401 и это не повторный запрос
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Пытаемся обновить токен
            await oauth2API.autoRefreshToken();

            // Обновляем заголовок и повторяем запрос
            const newToken = oauth2API.getAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Если не удалось обновить токен, очищаем и редиректим на логин
            oauth2API.clearTokens();
            window.location.href = "/auth/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    },
  };
};
