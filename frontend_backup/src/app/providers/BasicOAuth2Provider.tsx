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
        
        console.log('🚀 BasicOAuth2Provider: Initializing authentication...');

        // Проверяем есть ли токен
        const hasValidToken = apiUtils.isAuthenticated();
        console.log('🔍 BasicOAuth2Provider: Token check result:', hasValidToken);

        if (hasValidToken) {
          // Получаем данные пользователя из storage
          const storedUser = getUserFromStorage();
          console.log('📱 BasicOAuth2Provider: Stored user data:', storedUser ? 'found' : 'not found');

          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Если нет данных пользователя, пытаемся получить с сервера
            try {
              console.log('📱 BasicOAuth2Provider: Fetching user data from server...');
              // Простой запрос к /users/me для получения данных пользователя
              const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/me`,
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
                console.log('✅ BasicOAuth2Provider: User data fetched successfully');
              } else if (response.status === 401 || response.status === 403) {
                // Очищаем токены только при явных ошибках аутентификации
                console.log('🗑️ BasicOAuth2Provider: Clearing tokens due to auth error:', response.status);
                apiUtils.tokens.clear();
                setIsAuthenticated(false);
              } else {
                // При других ошибках (сеть, 500, etc) не очищаем токены
                console.warn('⚠️ BasicOAuth2Provider: Failed to fetch user data, but keeping tokens:', response.status);
                setIsAuthenticated(false);
              }
            } catch (fetchError) {
              console.warn("⚠️ BasicOAuth2Provider: Network error fetching user data, keeping tokens:", fetchError);
              // НЕ очищаем токены при сетевых ошибках
              setIsAuthenticated(false);
            }
          }
        } else {
          console.log('❌ BasicOAuth2Provider: No valid token found');
          setIsAuthenticated(false);
        }
      } catch (initError) {
        console.error("❌ BasicOAuth2Provider: Auth initialization failed:", initError);
        setError(initError as Error);
        setIsAuthenticated(false);
      } finally {
        console.log('🏁 BasicOAuth2Provider: Initialization complete');
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

        console.log('🔐 BasicOAuth2Provider: Attempting login...');

        // OAuth2 API ожидает form data для /auth/login
        const formData = new URLSearchParams();
        formData.append("username", credentials.email);
        formData.append("password", credentials.password);

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Login failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.access_token && data.refresh_token) {
          // Сохраняем токены с правильным expires_in
          apiUtils.tokens.save(data.access_token, data.refresh_token, data.expires_in);

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
          console.log('✅ BasicOAuth2Provider: Login successful');
        } else {
          throw new Error("Invalid login response");
        }
      } catch (loginError) {
        console.error("❌ BasicOAuth2Provider: Login failed:", loginError);
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
      console.log('🚪 BasicOAuth2Provider: Logging out...');
      
      // Очищаем все данные
      apiUtils.tokens.clear();
      setUser(undefined);
      setIsAuthenticated(false);
      setError(undefined);

      console.log('✅ BasicOAuth2Provider: Logout successful');

      // Перенаправляем если указан returnTo
      if (options?.returnTo && typeof window !== "undefined") {
        console.log('🔄 Redirecting to:', options.returnTo);
        window.location.href = options.returnTo;
      } else {
        // По умолчанию перенаправляем на страницу входа
        if (typeof window !== "undefined") {
          console.log('🔄 Redirecting to auth page');
          window.location.href = "/auth";
        }
      }
    } catch (logoutError) {
      console.error("❌ BasicOAuth2Provider: Logout failed:", logoutError);
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
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`,
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
              apiUtils.tokens.save(data.access_token, data.refresh_token, data.expires_in);
              return data.access_token;
            }
          } else {
            console.warn('⚠️ BasicOAuth2Provider: Token refresh failed with status:', response.status);
            throw new Error(`Token refresh failed: ${response.status}`);
          }
        } catch (refreshError) {
          console.error("❌ BasicOAuth2Provider: Token refresh failed:", refreshError);
          // НЕ вызываем logout здесь - это может вызвать циклическую очистку токенов
          // Пусть вызывающий код решает что делать
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
