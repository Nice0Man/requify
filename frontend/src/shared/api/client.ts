import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

export interface TokenManager {
  getAccessToken(): string | null;
  refreshToken(): Promise<string | null>;
  clearTokens(): void;
}

// Simple TokenManager implementation using localStorage directly
class SimpleTokenManager implements TokenManager {
  // Use the same keys as authStorage
  private readonly ACCESS_TOKEN_KEY = 'requify_access_token';
  private readonly REFRESH_TOKEN_KEY = 'requify_refresh_token';

  getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return null;
      }

      // Create a separate axios instance to avoid interceptor conflicts
      const refreshClient = axios.create({
        baseURL: '/api/v1',
        timeout: 10000,
      });

      // Make direct refresh request to avoid circular dependency
      const response = await refreshClient.post('/auth/refresh', 
        new URLSearchParams({ refresh_token: refreshToken }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data?.access_token) {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refresh_token);
        }
        
        // Also update token expiry if provided
        if (response.data.expires_in) {
          const expiry = Date.now() + response.data.expires_in * 1000;
          localStorage.setItem('requify_token_expiry', expiry.toString());
        }
        
        return response.data.access_token;
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  }

  clearTokens(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem('requify_token_expiry');
    } catch {
      // Ignore localStorage errors
    }
  }
}

export class ApiClient {
  private client: AxiosInstance;
  private tokenManager?: TokenManager;

  constructor(baseURL?: string) {
    // Determine baseURL based on environment
    // Docker development: use VITE_API_URL if provided
    // Standalone development: use proxy path
    // Production: use full backend URL
    let apiBaseUrl = baseURL;

    if (!apiBaseUrl) {
      if (import.meta.env.VITE_API_URL) {
        // Docker development or production with explicit API URL
        apiBaseUrl = import.meta.env.VITE_API_URL;
      } else if (import.meta.env.DEV) {
        // Standalone development with Vite proxy
        apiBaseUrl = "/api/v1";
      } else {
        // Fallback for production
        apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://backend:8000/api/v1";
      }
    }

    // Configuration logging removed

    this.client = axios.create({
      baseURL: apiBaseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: false, // Use Bearer token instead
    });

    this.setupInterceptors();
  }

  setTokenManager(tokenManager: TokenManager) {
    this.tokenManager = tokenManager;
  }

  private setupInterceptors() {
    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = this.tokenManager?.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Request logging removed

        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            if (this.tokenManager) {
              const newToken = await this.tokenManager.refreshToken();
              if (newToken && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.client(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.tokenManager?.clearTokens();
            window.location.href = "/login";
            return Promise.reject(this.handleError(refreshError as AxiosError));
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return {
        message: data?.message || data?.detail || "An error occurred",
        status: error.response.status,
        code: data?.error || data?.code,
        details: data?.details || data,
      };
    } else if (error.request) {
      // Network error
      return {
        message: "Network error. Please check your connection.",
        status: 0,
        code: "NETWORK_ERROR",
      };
    } else {
      // Something else happened
      return {
        message: error.message || "An unexpected error occurred",
        status: 0,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return {
      data: response.data,
      status: response.status,
      message: (response.data as any)?.message,
    };
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return {
      data: response.data,
      status: response.status,
      message: (response.data as any)?.message,
    };
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return {
      data: response.data,
      status: response.status,
      message: (response.data as any)?.message,
    };
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    );
    return {
      data: response.data,
      status: response.status,
      message: (response.data as any)?.message,
    };
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return {
      data: response.data,
      status: response.status,
      message: (response.data as any)?.message,
    };
  }

  // File upload
  async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    };

    return this.post<T>(url, formData, config);
  }

  // File download
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Create and set token manager
const tokenManager = new SimpleTokenManager();
apiClient.setTokenManager(tokenManager);
