import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/shared/api/auth.api";
import { tokenStorage } from "@/shared/utils";
import type {
  UserProfile,
  LoginRequest,
  PasswordChangeRequest,
} from "@/shared/types";

export interface AuthState {
  user: (UserProfile & { email: string }) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Register data interface
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  name?: string;
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  validateToken: () => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

/**
 * Custom hook for authentication management
 * Provides authentication state and methods for login, logout, registration, etc.
 */
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const navigate = useNavigate();

  /**
   * Validate token using API
   */
  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) return false;

      const response = await authApi.validateToken({ token: accessToken });
      return response.data.valid;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }, []);

  /**
   * Initialize auth state from stored tokens
   */
  const initializeAuth = useCallback(async () => {
    try {
      const accessToken = tokenStorage.getAccessToken();

      if (!accessToken) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Validate token and get user info
      const isValid = await validateToken();
      if (isValid) {
        const user = tokenStorage.getUser();
        setState((prev) => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else {
        // Token is invalid, clear storage
        tokenStorage.clearAll();
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      tokenStorage.clearAll();
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Ошибка инициализации аутентификации",
      }));
    }
  }, [validateToken]);

  /**
   * Login user with credentials
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await authApi.login(credentials);
        const { user, access_token, refresh_token } = response.data;

        // Store tokens and user data
        tokenStorage.setAccessToken(access_token);
        tokenStorage.setRefreshToken(refresh_token);
        tokenStorage.setUser(user);

        setState((prev) => ({
          ...prev,
          user: {
            ...user,
            email: user.email || "",
            is_active: user.is_active ?? true,
            is_superuser: user.is_superuser ?? false,
            email_verified: user.email_verified ?? false,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));

        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Ошибка входа в систему",
        }));
        throw error;
      }
    },
    [navigate]
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (data: RegisterData) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await authApi.register(data);
        const { user, access_token, refresh_token } = response.data;

        // Store tokens and user data
        tokenStorage.setAccessToken(access_token);
        tokenStorage.setRefreshToken(refresh_token);
        tokenStorage.setUser(user);

        setState((prev) => ({
          ...prev,
          user: {
            ...user,
            email: user.email || "",
            is_active: user.is_active ?? true,
            is_superuser: user.is_superuser ?? false,
            email_verified: user.email_verified ?? false,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));

        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Ошибка регистрации",
        }));
        throw error;
      }
    },
    [navigate]
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Call logout API to invalidate token on server
      await authApi.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local storage
      tokenStorage.clearAll();

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Redirect to login
      navigate("/auth/login");
    }
  }, [navigate]);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = tokenStorage.getRefreshToken();

      if (!refreshTokenValue) {
        throw new Error("Refresh token not found");
      }

      const response = await authApi.refreshToken({
        refresh_token: refreshTokenValue,
      });
      const { access_token, refresh_token: newRefreshToken } = response.data;

      // Update stored tokens
      tokenStorage.setAccessToken(access_token);
      if (newRefreshToken) {
        tokenStorage.setRefreshToken(newRefreshToken);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  }, [logout]);

  /**
   * Change user password
   */
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const request: PasswordChangeRequest = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      };

      await authApi.changePassword(request);
    },
    []
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    validateToken,
    changePassword,
  };
};
