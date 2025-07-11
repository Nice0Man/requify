import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { oauth2API } from '@/shared/api/oauth2';
import type { LoginRequest, LoginResponse } from '@/features/auth/api/authApi';

// Типы для Basic OAuth2
interface BasicOAuth2User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface BasicOAuth2ContextValue {
  user?: BasicOAuth2User;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: Error;
  loginWithCredentials: (credentials: LoginRequest) => Promise<void>;
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
  getAccessTokenSilently: async () => '',
  refreshToken: async () => {},
});

// Hook для использования контекста (совместимый с useAuth0)
export const useAuth0 = () => {
  const context = useContext(BasicOAuth2Context);
  if (!context) {
    throw new Error('useAuth0 must be used within BasicOAuth2Provider');
  }
  return context;
};

interface BasicOAuth2ProviderProps {
  children: React.ReactNode;
}

export const BasicOAuth2Provider: React.FC<BasicOAuth2ProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<BasicOAuth2User | undefined>();
  const [error, setError] = useState<Error | undefined>();

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        if (oauth2API.isAuthenticated()) {
          const currentUser = await oauth2API.getCurrentUser();
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role,
          });
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.info('User not authenticated or token expired');
        oauth2API.clearTokens();
        setIsAuthenticated(false);
        setUser(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginWithCredentials = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const response: LoginResponse = await oauth2API.login(credentials);
      
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
      });
      setIsAuthenticated(true);
      
      console.info('🔐 Basic OAuth2: Успешная аутентификация');
    } catch (err: any) {
      setError(err);
      setIsAuthenticated(false);
      setUser(undefined);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (options?: { returnTo?: string }) => {
    try {
      await oauth2API.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(undefined);
      setIsAuthenticated(false);
      console.info('🔐 Basic OAuth2: Выход выполнен');
      
      if (options?.returnTo) {
        window.location.href = options.returnTo;
      }
    }
  }, []);

  const getAccessTokenSilently = useCallback(async (): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    // Проверяем, нужно ли обновить токен
    if (oauth2API.shouldRefreshToken()) {
      await oauth2API.autoRefreshToken();
    }

    const token = oauth2API.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    return token;
  }, [isAuthenticated]);

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = oauth2API.getRefreshToken();
      if (refreshTokenValue) {
        await oauth2API.refreshTokens(refreshTokenValue);
        console.info('🔐 Basic OAuth2: Токен обновлен');
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      oauth2API.clearTokens();
      setIsAuthenticated(false);
      setUser(undefined);
      throw err;
    }
  }, []);

  const value: BasicOAuth2ContextValue = {
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
    <BasicOAuth2Context.Provider value={value}>
      {children}
    </BasicOAuth2Context.Provider>
  );
}; 