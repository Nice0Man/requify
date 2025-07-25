import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiUtils } from "./client";

/**
 * App Layer Basic OAuth2 Provider
 * Простой провайдер аутентификации согласно FSD архитектуре
 * БЕЗ МОКОВ И НАРУШЕНИЙ FSD ПРАВИЛ
 */

// Типы для Basic OAuth2 (локальные для app слоя)
interface BasicOAuth2User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface BasicOAuth2ContextValue {
  user?: BasicOAuth2User;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: Error;
  loginWithCredentials: (credentials: LoginCredentials) => Promise<void>;
  logout: (options?: { returnTo?: string }) => void;
  getAccessTokenSilently: () => Promise<string>;
  refreshToken: () => Promise<void>;
}

// Создаем контекст
const BasicOAuth2Context = createContext<BasicOAuth2ContextValue>({
  isAuthenticated: false,
  isLoading: false,
  loginWithCredentials: async () => {},
  logout: () => {},
  getAccessTokenSilently: async () => "",
  refreshToken: async () => {},
});

// Hook для использования контекста (совместимый с useAuth0)
export const useAuth0 = () => {
  const context = useContext(BasicOAuth2Context);
  if (!context) {
    throw new Error("useAuth0 must be used within BasicOAuth2Provider");
  }
  return context;
};

interface BasicOAuth2ProviderProps {
  children: React.ReactNode;
}

export const BasicOAuth2Provider: React.FC<BasicOAuth2ProviderProps> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<BasicOAuth2User | undefined>();
  const [error, setError] = useState<Error | undefined>();

  // Получение пользователя из localStorage
  const getUserFromStorage = (): BasicOAuth2User | null => {
    try {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  // Сохранение пользователя в localStorage
  const saveUserToStorage = (userData: BasicOAuth2User): void => {
    try {
      localStorage.setItem("user_data", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  };

  // Инициализация при загрузке
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Проверяем есть ли токен
        const hasValidToken = apiUtils.isAuthenticated();

        if (hasValidToken) {
          // Получаем данные пользователя из storage
          const storedUser = getUserFromStorage();

          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Если нет данных пользователя, пытаемся получить с сервера
            try {
              // Простой запрос к /users/me для получения данных пользователя
              const response = await fetch(
                `${
                  import.meta.env.VITE_API_BASE_URL ||
                  "http://localhost:8000/api/v1"
                }/users/me`,
                {
                  headers: apiUtils.getAuthHeaders(),
                }
              );

              if (response.ok) {
                const userData = await response.json();
                const user: BasicOAuth2User = {
                  id: userData.id,
                  email: userData.email,
                  name: userData.username || userData.email,
                  role: userData.role || "user",
                };

                setUser(user);
                saveUserToStorage(user);
                setIsAuthenticated(true);
              } else {
                // Если не удалось получить пользователя, очищаем токены
                apiUtils.tokens.clear();
                setIsAuthenticated(false);
              }
            } catch (fetchError) {
              console.warn("Failed to fetch user data:", fetchError);
              apiUtils.tokens.clear();
              setIsAuthenticated(false);
            }
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (initError) {
        console.error("Auth initialization failed:", initError);
        setError(initError as Error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Вход в систему
  const loginWithCredentials = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      try {
        setIsLoading(true);
        setError(undefined);

        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
          }/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          }
        );

        if (!response.ok) {
          throw new Error(`Login failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.access_token && data.refresh_token) {
          // Сохраняем токены
          apiUtils.tokens.save(data.access_token, data.refresh_token);

          // Создаем объект пользователя
          const userData: BasicOAuth2User = {
            id: data.user?.id || "unknown",
            email: data.user?.email || credentials.email,
            name: data.user?.username || credentials.email,
            role: data.user?.role || "user",
          };

          setUser(userData);
          saveUserToStorage(userData);
          setIsAuthenticated(true);
        } else {
          throw new Error("Invalid login response");
        }
      } catch (loginError) {
        console.error("Login failed:", loginError);
        setError(loginError as Error);
        setIsAuthenticated(false);
        throw loginError;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Выход из системы
  const logout = useCallback((options?: { returnTo?: string }): void => {
    try {
      // Очищаем все данные
      apiUtils.tokens.clear();
      setUser(undefined);
      setIsAuthenticated(false);
      setError(undefined);

      // Перенаправляем если указан returnTo
      if (options?.returnTo && typeof window !== "undefined") {
        window.location.href = options.returnTo;
      } else {
        // По умолчанию перенаправляем на страницу входа
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
      }
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    }
  }, []);

  // Получение токена
  const getAccessTokenSilently = useCallback(async (): Promise<string> => {
    const token = apiUtils.tokens.get();

    if (!token) {
      throw new Error("No access token available");
    }

    // Проверяем нужно ли обновить токен
    if (apiUtils.tokens.shouldRefresh()) {
      const refreshToken = apiUtils.tokens.getRefresh();
      if (refreshToken) {
        try {
          // Обновляем токен через прямой запрос
          const response = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL ||
              "http://localhost:8000/api/v1"
            }/auth/refresh`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refresh_token: refreshToken }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.access_token && data.refresh_token) {
              apiUtils.tokens.save(data.access_token, data.refresh_token);
              return data.access_token;
            }
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          logout();
          throw new Error("Token refresh failed");
        }
      }
    }

    return token;
  }, [logout]);

  // Обновление токена
  const refreshToken = useCallback(async (): Promise<void> => {
    await getAccessTokenSilently();
  }, [getAccessTokenSilently]);

  const contextValue: BasicOAuth2ContextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithCredentials,
    logout,
    getAccessTokenSilently,
    refreshToken,
  };

  return (
    <BasicOAuth2Context.Provider value={contextValue}>
      {children}
    </BasicOAuth2Context.Provider>
  );
};
