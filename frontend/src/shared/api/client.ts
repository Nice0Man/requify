import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Create axios instance with default config
export const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
client.interceptors.request.use(
  (config) => {
    // Проверяем различные варианты хранения токенов
    const token = 
      localStorage.getItem("authToken") ||           // Стандартная аутентификация
      localStorage.getItem("access_token") ||        // OAuth2 токены 
      localStorage.getItem("token");                 // Legacy токены
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
client.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - очищаем все возможные токены
      localStorage.removeItem("authToken");          // Стандартная аутентификация
      localStorage.removeItem("refreshToken");       // Стандартная аутентификация
      localStorage.removeItem("access_token");       // OAuth2 токены
      localStorage.removeItem("refresh_token");      // OAuth2 токены  
      localStorage.removeItem("token_expires_at");   // OAuth2 токены
      localStorage.removeItem("token");              // Legacy токены
      
      // Перенаправляем на страницу аутентификации
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default client;
