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

export class ApiClient {
  private client: AxiosInstance;
  private tokenManager?: TokenManager;

  constructor(baseURL?: string) {
    // Use environment variable or default to nginx proxy path
    const apiBaseUrl =
      baseURL ||
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? "/api/v1" : "http://localhost/api/v1");

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

export interface TokenManager {
  getAccessToken(): string | null;
  refreshToken(): Promise<string | null>;
  clearTokens(): void;
}

// Create and export singleton instance
export const apiClient = new ApiClient();
