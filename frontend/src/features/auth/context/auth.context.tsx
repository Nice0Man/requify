import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { toast } from "react-toastify";
import { authApi } from "../api/auth.api";
import { apiClient } from "@/shared/api/client";
import { tokenStorage } from "@/shared/utils/tokenStorage";
import {
  AuthState,
  UserProfile,
  LoginRequest,
  UserCreate,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  AuthError,
} from "../types/auth.types";

// Auth context type
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenMethod: () => Promise<string | null>;
  changePassword: (request: PasswordChangeRequest) => Promise<void>;
  requestPasswordReset: (request: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (request: PasswordResetConfirm) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

// Auth reducer actions
type AuthAction =
  | { type: "AUTH_START" }
  | {
      type: "AUTH_SUCCESS";
      payload: {
        user: UserProfile;
        accessToken: string;
        refreshToken: string;
        permissions: string[];
      };
    }
  | { type: "AUTH_FAILURE"; payload: AuthError }
  | { type: "AUTH_LOGOUT" }
  | { type: "TOKEN_REFRESH_SUCCESS"; payload: { accessToken: string } }
  | { type: "PROFILE_UPDATE_SUCCESS"; payload: UserProfile }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

// Initial state - determine if we should be loading based on stored tokens
const initialState: AuthState = {
  user: tokenStorage.getUser(),
  accessToken: tokenStorage.getAccessToken(),
  refreshToken: tokenStorage.getRefreshToken(),
  isAuthenticated: false,
  isLoading: tokenStorage.hasTokens(), // Start loading if we have tokens to validate
  error: null,
  permissions: tokenStorage.getPermissions(),
  sessions: [],
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      tokenStorage.setAccessToken(action.payload.accessToken);
      tokenStorage.setRefreshToken(action.payload.refreshToken);
      tokenStorage.setPermissions(action.payload.permissions);
      tokenStorage.setUser(action.payload.user);
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        permissions: action.payload.permissions,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case "AUTH_FAILURE":
      tokenStorage.clearAll();
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case "AUTH_LOGOUT":
      tokenStorage.clearAll();
      return {
        ...initialState,
        user: null,
        accessToken: null,
        refreshToken: null,
        permissions: [],
        isLoading: false,
      };

    case "TOKEN_REFRESH_SUCCESS":
      tokenStorage.setAccessToken(action.payload.accessToken);
      return {
        ...state,
        accessToken: action.payload.accessToken,
        error: null,
      };

    case "PROFILE_UPDATE_SUCCESS":
      return {
        ...state,
        user: action.payload,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token manager implementation
class AuthTokenManager {
  constructor(
    private dispatch: React.Dispatch<AuthAction>,
    private refreshTokenValue: string | null
  ) {}

  getAccessToken(): string | null {
    return tokenStorage.getAccessToken();
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken =
        this.refreshTokenValue || tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authApi.refreshToken({
        refresh_token: refreshToken,
      });

      this.dispatch({
        type: "TOKEN_REFRESH_SUCCESS",
        payload: { accessToken: response.data.access_token },
      });

      return response.data.access_token;
    } catch (error) {
      this.dispatch({ type: "AUTH_LOGOUT" });
      return null;
    }
  }

  clearTokens(): void {
    this.dispatch({ type: "AUTH_LOGOUT" });
  }
}

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Setup API client token manager
  useEffect(() => {
    const tokenManager = new AuthTokenManager(dispatch, state.refreshToken);
    apiClient.setTokenManager(tokenManager);
  }, [state.refreshToken]);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      dispatch({ type: "AUTH_START" });

      const response = await authApi.login(credentials);

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: response.data.user,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          permissions: response.data.permissions,
        },
      });

      toast.success("Login successful");
    } catch (error: any) {
      const authError: AuthError = {
        error: error.code || "LOGIN_FAILED",
        error_description: error.message || "Login failed",
        error_details: error.details,
      };

      dispatch({ type: "AUTH_FAILURE", payload: authError });
      toast.error(authError.error_description);
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: UserCreate) => {
    try {
      dispatch({ type: "AUTH_START" });

      const response = await authApi.register(userData);

      // After successful registration, automatically log the user in
      const loginResponse = await authApi.login({
        username: userData.username,
        password: userData.password,
      });

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: loginResponse.data.user,
          accessToken: loginResponse.data.access_token,
          refreshToken: loginResponse.data.refresh_token,
          permissions: loginResponse.data.permissions,
        },
      });

      toast.success("Registration successful! Welcome to Requify!");
    } catch (error: any) {
      const authError: AuthError = {
        error: error.code || "REGISTRATION_FAILED",
        error_description: error.message || "Registration failed",
        error_details: error.details,
      };

      dispatch({ type: "AUTH_FAILURE", payload: authError });
      toast.error(authError.error_description);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.refreshToken) {
        await authApi.logout({ refresh_token: state.refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "AUTH_LOGOUT" });
      toast.info("Logged out successfully");
    }
  }, [state.refreshToken]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      if (!state.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authApi.refreshToken({
        refresh_token: state.refreshToken,
      });

      dispatch({
        type: "TOKEN_REFRESH_SUCCESS",
        payload: { accessToken: response.data.access_token },
      });

      return response.data.access_token;
    } catch (error) {
      dispatch({ type: "AUTH_LOGOUT" });
      return null;
    }
  }, [state.refreshToken]);

  const changePassword = useCallback(async (request: PasswordChangeRequest) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await authApi.changePassword(request);
      toast.success("Password changed successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const requestPasswordReset = useCallback(
    async (request: PasswordResetRequest) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        await authApi.requestPasswordReset(request);
        toast.success("Password reset instructions sent to your email");
      } catch (error: any) {
        toast.error(error.message || "Failed to request password reset");
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    []
  );

  const confirmPasswordReset = useCallback(
    async (request: PasswordResetConfirm) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        await authApi.confirmPasswordReset(request);
        toast.success("Password reset successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to reset password");
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    []
  );

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      // Import usersApi dynamically to avoid circular dependencies
      const { usersApi } = await import("../api/users.api");
      const response = await usersApi.updateCurrentUser(data);

      dispatch({
        type: "PROFILE_UPDATE_SUCCESS",
        payload: response.data,
      });

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      // Import usersApi dynamically to avoid circular dependencies
      const { usersApi } = await import("../api/users.api");
      const response = await usersApi.getCurrentUser();

      dispatch({
        type: "PROFILE_UPDATE_SUCCESS",
        payload: response.data,
      });
    } catch (error: any) {
      console.error("Failed to refresh user data:", error);
      // Don't show toast for this since it's a background operation
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();
      const permissions = tokenStorage.getPermissions();

      if (!accessToken || !refreshToken) {
        dispatch({ type: "AUTH_LOGOUT" });
        return;
      }

      dispatch({ type: "SET_LOADING", payload: true });

      // Validate token and get current user
      const response = await authApi.validateToken({ token: accessToken });

      if (response.data.valid && response.data.user) {
        dispatch({
          type: "AUTH_SUCCESS",
          payload: {
            user: response.data.user,
            accessToken,
            refreshToken,
            permissions,
          },
        });
      } else {
        dispatch({ type: "AUTH_LOGOUT" });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      dispatch({ type: "AUTH_LOGOUT" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshTokenMethod: refreshToken,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
    updateProfile,
    refreshUserData,
    clearError,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Permission checking hook
export const usePermissions = () => {
  const { permissions } = useAuth();

  // Ensure permissions is always an array
  const safePermissions = permissions || [];

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return safePermissions.includes(permission);
    },
    [safePermissions]
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (
        !Array.isArray(requiredPermissions) ||
        requiredPermissions.length === 0
      ) {
        return true; // No permissions required
      }
      return requiredPermissions.some((permission) =>
        safePermissions.includes(permission)
      );
    },
    [safePermissions]
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (
        !Array.isArray(requiredPermissions) ||
        requiredPermissions.length === 0
      ) {
        return true; // No permissions required
      }
      return requiredPermissions.every((permission) =>
        safePermissions.includes(permission)
      );
    },
    [safePermissions]
  );

  return {
    permissions: safePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasPermissions: hasAllPermissions, // Alias for backward compatibility
  };
};
