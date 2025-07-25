import axios, { AxiosInstance, AxiosResponse } from "axios";

/**
 * App Layer API Client
 * Простой HTTP клиент для app слоя согласно FSD архитектуре
 * БЕЗ МОКОВ И ЦИКЛИЧЕСКИХ ЗАВИСИМОСТЕЙ
 */

// Создаем экземпляр axios с базовой конфигурацией
export const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Флаг для предотвращения множественных запросов на обновление токена
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: any) => void;
}> = [];

// Обработка очереди запросов после обновления токена
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Получение токена из localStorage (без зависимостей)
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('access_token');
  } catch {
    return null;
  }
};

// Получение refresh токена из localStorage
const getStoredRefreshToken = (): string | null => {
  try {
    return localStorage.getItem('refresh_token');
  } catch {
    return null;
  }
};

// Сохранение токенов в localStorage
const saveTokens = (accessToken: string, refreshToken: string): void => {
  try {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('token_expires_at', (Date.now() + 3600000).toString());
  } catch (error) {
    console.error('Failed to save tokens:', error);
  }
};

// Очистка токенов
const clearTokens = (): void => {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user_data');
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
};

// Проверка нужно ли обновить токен
const shouldRefreshToken = (): boolean => {
  try {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return false;
    
    const expiryTime = parseInt(expiresAt);
    const currentTime = Date.now();
    
    // Обновляем токен за 5 минут до истечения
    return (expiryTime - currentTime) < 300000;
  } catch {
    return false;
  }
};

// Обновление токена через API
const refreshTokenRequest = async (refreshToken: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"}/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    
    if (response.data.access_token && response.data.refresh_token) {
      saveTokens(response.data.access_token, response.data.refresh_token);
      return response.data.access_token;
    }
    
    throw new Error('Invalid refresh response');
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    throw error;
  }
};

// Request interceptor для добавления токена аутентификации
client.interceptors.request.use(
  async (config) => {
    const token = getStoredToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug("🔐 API Request: Adding token to", config.url);
      
      // Проверяем нужно ли обновить токен
      if (shouldRefreshToken()) {
        console.debug("🔄 API Request: Token needs refresh");
        const refreshToken = getStoredRefreshToken();
        if (refreshToken) {
          try {
            await refreshTokenRequest(refreshToken);
            // Обновляем заголовок с новым токеном
            const newToken = getStoredToken();
            if (newToken) {
              config.headers.Authorization = `Bearer ${newToken}`;
            }
          } catch (error) {
            console.warn("⚠️ Background token refresh failed:", error);
          }
        }
      }
    } else {
      console.warn("⚠️ API Request: No access token found for", config.url);
    }

    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor для обработки ошибок и автоматического обновления токена
client.interceptors.response.use(
  (response: AxiosResponse) => {
    console.debug("✅ API Response Success:", response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("🔐 401 Unauthorized detected for:", originalRequest.url);

      // Если уже происходит обновление токена, добавляем запрос в очередь
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            const newToken = getStoredToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return client(originalRequest);
            }
            throw new Error('No token after refresh');
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.info("🔄 Attempting to refresh token...");
        
        const refreshToken = getStoredRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Обновляем токен
        const newAccessToken = await refreshTokenRequest(refreshToken);
        console.info("✅ Token refreshed successfully");

        // Обрабатываем очередь запросов
        processQueue(null, newAccessToken);

        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(originalRequest);
        
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
        
        // Очищаем токены при неудачном обновлении
        clearTokens();
        
        // Обрабатываем очередь с ошибкой
        processQueue(refreshError, null);

        // Перенаправляем на страницу авторизации
        if (typeof window !== "undefined") {
          console.info("🔄 Redirecting to auth page due to token refresh failure");
          window.location.href = "/auth";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Логируем другие ошибки API
    console.error("❌ API Response Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

/**
 * Утилиты для работы с API (без зависимостей)
 */
export const apiUtils = {
  /**
   * Проверяет доступность API
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await client.get('/admin/health');
      return response.status === 200;
    } catch {
      return false;
    }
  },

  /**
   * Получает текущие заголовки авторизации
   */
  getAuthHeaders(): Record<string, string> {
    const token = getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  /**
   * Проверяет аутентификацию
   */
  isAuthenticated(): boolean {
    const token = getStoredToken();
    const expiresAt = localStorage.getItem('token_expires_at');
    
    if (!token || !expiresAt) return false;
    
    try {
      const expiryTime = parseInt(expiresAt);
      return Date.now() < expiryTime;
    } catch {
      return false;
    }
  },

  /**
   * Утилиты для токенов (экспорт для других слоев)
   */
  tokens: {
    get: getStoredToken,
    getRefresh: getStoredRefreshToken,
    save: saveTokens,
    clear: clearTokens,
    shouldRefresh: shouldRefreshToken,
  }
};
