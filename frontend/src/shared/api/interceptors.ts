// API interceptors
import {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

export const setupRequestInterceptors = (client: AxiosInstance) => {
  // Request interceptor for adding auth token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export const setupResponseInterceptors = (client: AxiosInstance) => {
  // Response interceptor for handling common errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("auth_token");
        window.location.href = "/auth";
      }
      return Promise.reject(error);
    }
  );
};

export const setupInterceptors = (client: AxiosInstance) => {
  setupRequestInterceptors(client);
  setupResponseInterceptors(client);
};
