import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { oauth2API } from "@/shared/api";
import { userDAO } from "@/entities/user";
import { UserProfile } from "@/shared/types/user";

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Проверяем аутентификацию на основе OAuth2 токенов
  const isAuthenticated = oauth2API.isAuthenticated();

  // Получение данных текущего пользователя
  const refreshUser = useCallback(async () => {
    if (!oauth2API.isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Используем userDAO для получения профиля пользователя
      const userProfile = await userDAO.getCurrentUserProfile();
      setUser(userProfile);
    } catch (err: any) {
      console.error("Failed to fetch user profile:", err);
      
      // Если ошибка 401, очищаем токены
      if (err.response?.status === 401) {
        oauth2API.clearTokens();
        setUser(null);
      }
      
      setError(err.message || "Не удалось загрузить профиль пользователя");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Выход из системы
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Пытаемся корректно выйти через API
      await oauth2API.logout();
    } catch (err) {
      console.warn("Logout API call failed, clearing tokens anyway:", err);
    } finally {
      // В любом случае очищаем локальные данные
      oauth2API.clearTokens();
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  // Инициализация при загрузке компонента
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Проверяем есть ли действительные токены
        if (oauth2API.isAuthenticated()) {
          // Загружаем профиль пользователя
          await refreshUser();
        } else {
          // Если токенов нет, очищаем состояние
          setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        setError("Ошибка инициализации аутентификации");
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [refreshUser]);

  // Слушаем изменения в localStorage для синхронизации между вкладками
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "access_token" || event.key === "refresh_token") {
        if (event.newValue) {
          // Токен добавлен/обновлен - обновляем пользователя
          refreshUser();
        } else {
          // Токен удален - очищаем состояние
          setUser(null);
          setError(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshUser]);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading: isLoading || !isInitialized,
    error,
    isInitialized,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
