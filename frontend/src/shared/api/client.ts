import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

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

// Request interceptor для добавления токена аутентификации
client.interceptors.request.use(
  async (config) => {
    try {
      // Импортируем OAuth2API динамически для избежания циклических зависимостей
      const { oauth2API } = await import("./oauth2");

      // Получаем токен через OAuth2API
      const token = oauth2API.getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.debug("🔐 API Request: Adding OAuth2 token to", config.url);

        // Проверяем нужно ли обновить токен
        if (oauth2API.shouldRefreshToken()) {
          console.debug(
            "🔄 API Request: Token needs refresh, triggering auto-refresh"
          );
          // Не блокируем запрос, просто запускаем обновление в фоне
          oauth2API.autoRefreshToken().catch((error) => {
            console.warn("⚠️ Background token refresh failed:", error);
          });
        }
      } else {
        console.warn(
          "⚠️ API Request: No OAuth2 access token found for",
          config.url
        );
      }
    } catch (error) {
      console.error("❌ API Request: Failed to get OAuth2 token:", error);
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
    console.debug(
      "✅ API Response Success:",
      response.config.url,
      response.status
    );
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
            // Повторяем запрос с новым токеном
            return retryRequestWithNewToken(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.info("🔄 Attempting to refresh OAuth2 token...");

        // Импортируем OAuth2API динамически для избежания циклических зависимостей
        const { oauth2API } = await import("./oauth2");

        // Проверяем есть ли refresh token
        const refreshToken = oauth2API.getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Обновляем токен через OAuth2API
        await oauth2API.refreshTokens(refreshToken);

        console.info("✅ Token refreshed successfully");

        // Обрабатываем очередь запросов
        processQueue(null, oauth2API.getAccessToken());

        // Повторяем оригинальный запрос с новым токеном
        return retryRequestWithNewToken(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        // Импортируем OAuth2API для очистки токенов
        const { oauth2API } = await import("./oauth2");

        // Очищаем токены при неудачном обновлении
        oauth2API.clearTokens();

        // Обрабатываем очередь с ошибкой
        processQueue(refreshError, null);

        // Перенаправляем на страницу авторизации
        if (typeof window !== "undefined") {
          console.info(
            "🔄 Redirecting to auth page due to token refresh failure"
          );
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
 * Повторяет запрос с новым токеном
 */
async function retryRequestWithNewToken(originalRequest: any) {
  try {
    const { oauth2API } = await import("./oauth2");
    const newToken = oauth2API.getAccessToken();

    if (newToken) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      console.debug(
        "🔄 Retrying request with new OAuth2 token:",
        originalRequest.url
      );
      return client(originalRequest);
    } else {
      throw new Error("No access token available after refresh");
    }
  } catch (error) {
    console.error("❌ Failed to retry request with new token:", error);
    throw error;
  }
}

/**
 * Утилиты для прямого использования
 */
export const apiUtils = {
  /**
   * Проверяет доступность API
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Импортируем endpoints динамически для избежания циклических зависимостей  
      const { API_ENDPOINTS } = await import("./endpoints");
      const response = await client.get(API_ENDPOINTS.HEALTH_CHECK);
      return response.status === 200;
    } catch {
      return false;
    }
  },

  /**
   * Получает текущие заголовки авторизации
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const { oauth2API } = await import("./oauth2");
      const token = oauth2API.getAccessToken();
      
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  },

  /**
   * Проверяет аутентификацию
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { oauth2API } = await import("./oauth2");
      return oauth2API.isAuthenticated();
    } catch {
      return false;
    }
  },
};
