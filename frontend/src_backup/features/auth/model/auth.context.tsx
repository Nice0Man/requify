import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import type { UserProfile } from "@/entities/user";
import { authApi } from "../api/auth.api";
import { authStorage } from "./auth.storage";
import type {
  AuthState,
  AuthContextType,
  AuthAction,
  AuthError,
  LoginFormData,
  RegisterFormData,
  PasswordChangeFormData,
  PasswordResetFormData,
  PasswordResetConfirmFormData,
  EmailVerificationFormData,
  EmailVerificationConfirmFormData,
  ActiveSession,
} from "./auth.types";
import { AUTH_ERRORS } from "./auth.types";

// =============================================================================
// Initial State
// =============================================================================

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  user: null,
  permissions: [],
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  sessions: [],
  error: null,
  requireEmailVerification: false,
  allowRegistration: true,
  allowPasswordReset: true,
};

// =============================================================================
// Auth Reducer
// =============================================================================

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_INITIALIZE_START":
      return { ...state, isLoading: true, error: null };

    case "AUTH_INITIALIZE_SUCCESS":
      // Handle both authenticated and unauthenticated initialization
      if (action.payload) {
        return {
          ...state,
          isLoading: false,
          isInitialized: true,
          isAuthenticated: true,
          user: action.payload.user,
          permissions: action.payload.permissions,
          error: null,
        };
      } else {
        // Unauthenticated initialization
        return {
          ...state,
          isLoading: false,
          isInitialized: true,
          isAuthenticated: false,
          user: null,
          permissions: [],
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          error: null,
        };
      }

    case "AUTH_INITIALIZE_FAILURE":
      return {
        ...state,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: false,
        user: null,
        permissions: [],
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        error: action.payload,
      };

    case "AUTH_LOGIN_START":
    case "AUTH_REGISTER_START":
      return { ...state, isLoading: true, error: null };

    case "AUTH_LOGIN_SUCCESS":
    case "AUTH_REGISTER_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        permissions: action.payload.permissions,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        tokenExpiry: action.payload.tokenExpiry,
        error: null,
      };

    case "AUTH_LOGIN_FAILURE":
    case "AUTH_REGISTER_FAILURE":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        permissions: [],
        error: action.payload,
      };

    case "AUTH_LOGOUT_START":
      return { ...state, isLoading: true, error: null };

    case "AUTH_LOGOUT_SUCCESS":
      return { ...initialState, isInitialized: true, isLoading: false };

    case "AUTH_LOGOUT_FAILURE":
      return { ...state, isLoading: false, error: action.payload };

    case "AUTH_REFRESH_TOKEN_SUCCESS":
      return {
        ...state,
        isLoading: false,
        accessToken: action.payload.accessToken,
        tokenExpiry: action.payload.tokenExpiry,
        error: null,
      };

    case "AUTH_REFRESH_TOKEN_FAILURE":
      return { ...initialState, isInitialized: true, error: action.payload };

    case "AUTH_UPDATE_USER":
      return { ...state, user: action.payload };

    case "AUTH_UPDATE_PERMISSIONS":
      return { ...state, permissions: action.payload };

    case "AUTH_UPDATE_SESSIONS":
      return { ...state, sessions: action.payload };

    case "AUTH_CLEAR_ERROR":
      return { ...state, error: null };

    case "AUTH_SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// =============================================================================
// Auth Context
// =============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =============================================================================
  // Utility Methods
  // =============================================================================

  const clearError = useCallback(() => {
    dispatch({ type: "AUTH_CLEAR_ERROR" });
  }, []);

  const setError = useCallback((error: AuthError) => {
    dispatch({ type: "AUTH_SET_ERROR", payload: error });
  }, []);

  const createAuthError = useCallback(
    (message: string, code?: string): AuthError => {
      return {
        code: code || AUTH_ERRORS.UNKNOWN_ERROR,
        message,
      };
    },
    []
  );

  // =============================================================================
  // Permission Helpers
  // =============================================================================

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return state.permissions.includes(permission);
    },
    [state.permissions]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some((permission) =>
        state.permissions.includes(permission)
      );
    },
    [state.permissions]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      return permissions.every((permission) =>
        state.permissions.includes(permission)
      );
    },
    [state.permissions]
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      return state.user?.role === role;
    },
    [state.user]
  );

  // =============================================================================
  // Token Management
  // =============================================================================

  const scheduleTokenRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    if (!state.tokenExpiry) return;

    const now = Date.now();
    const expiry = state.tokenExpiry;
    const refreshTime = expiry - now - 60000; // Refresh 1 minute before expiry

    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshToken();
      }, refreshTime);
    }
  }, [state.tokenExpiry]);

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = authStorage.getRefreshToken();
      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const response = await authApi.refreshToken(refreshTokenValue);

      const tokenExpiry = Date.now() + response.expires_in * 1000;

      // Update storage
      authStorage.setAccessToken(response.access_token);
      if (response.refresh_token) {
        authStorage.setRefreshToken(response.refresh_token);
      }
      authStorage.setTokenExpiry(tokenExpiry);

      // Update state
      dispatch({
        type: "AUTH_REFRESH_TOKEN_SUCCESS",
        payload: {
          accessToken: response.access_token,
          tokenExpiry,
        },
      });

      // Schedule next refresh
      scheduleTokenRefresh();
    } catch (error: any) {
      const authError = createAuthError(
        error.message || "Token refresh failed",
        AUTH_ERRORS.TOKEN_EXPIRED
      );

      dispatch({ type: "AUTH_REFRESH_TOKEN_FAILURE", payload: authError });

      // Clear storage on refresh failure
      authStorage.clearAll();
    }
  }, [createAuthError, scheduleTokenRefresh]);

  // =============================================================================
  // Authentication Methods
  // =============================================================================

  const login = useCallback(
    async (credentials: LoginFormData) => {
      dispatch({ type: "AUTH_LOGIN_START" });

      try {
        const loginPayload = {
          username: credentials.username, // OAuth2 expects 'username' field
          password: credentials.password,
          remember_me: credentials.remember_me,
        };

        const response = await authApi.login(loginPayload);

        const tokenExpiry = Date.now() + response.expires_in * 1000;

        // Store auth data
        authStorage.setAuthData({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          tokenExpiry,
          expiresAt: new Date(tokenExpiry).toISOString(),
          user: response.user,
          permissions: response.permissions,
        });

        // Set remember me preference
        authStorage.setRememberMe(credentials.remember_me);
        authStorage.setLastLogin();

        dispatch({
          type: "AUTH_LOGIN_SUCCESS",
          payload: {
            user: response.user,
            permissions: response.permissions,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            tokenExpiry,
          },
        });

        // Schedule token refresh
        scheduleTokenRefresh();
      } catch (error: any) {
        const authError = createAuthError(
          error.message || "Login failed",
          AUTH_ERRORS.INVALID_CREDENTIALS
        );
        dispatch({ type: "AUTH_LOGIN_FAILURE", payload: authError });
      }
    },
    [createAuthError, scheduleTokenRefresh]
  );

  const register = useCallback(
    async (userData: RegisterFormData) => {
      dispatch({ type: "AUTH_REGISTER_START" });

      try {
        // Frontend validation - check password confirmation
        if (userData.password !== userData.confirm_password) {
          throw new Error("Passwords do not match");
        }

        // Frontend validation - check terms acceptance
        if (!userData.terms_accepted || !userData.privacy_accepted) {
          throw new Error("You must accept the terms and privacy policy");
        }

        const response = await authApi.register({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          department: userData.department,
          phone: userData.phone,
        });

        const tokenExpiry = Date.now() + response.expires_in * 1000;

        // Store auth data
        authStorage.setAuthData({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          tokenExpiry,
          expiresAt: new Date(tokenExpiry).toISOString(),
          user: response.user,
          permissions: response.permissions,
        });

        authStorage.setLastLogin();

        dispatch({
          type: "AUTH_REGISTER_SUCCESS",
          payload: {
            user: response.user,
            permissions: response.permissions,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            tokenExpiry,
          },
        });

        // Schedule token refresh
        scheduleTokenRefresh();
      } catch (error: any) {
        const authError = createAuthError(
          error.message || "Registration failed",
          AUTH_ERRORS.UNKNOWN_ERROR
        );
        dispatch({ type: "AUTH_REGISTER_FAILURE", payload: authError });
      }
    },
    [createAuthError, scheduleTokenRefresh]
  );

  const logout = useCallback(
    async (logoutAll = false) => {
      dispatch({ type: "AUTH_LOGOUT_START" });

      try {
        const refreshTokenValue = authStorage.getRefreshToken();

        await authApi.logout({
          refresh_token: refreshTokenValue || undefined,
          logout_all: logoutAll,
        });

        // Clear storage
        authStorage.clearAll();

        // Clear refresh timeout
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }

        dispatch({ type: "AUTH_LOGOUT_SUCCESS" });
      } catch (error: any) {
        // Even if logout fails, clear local data
        authStorage.clearAll();

        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }

        const authError = createAuthError(
          error.message || "Logout failed",
          AUTH_ERRORS.UNKNOWN_ERROR
        );
        dispatch({ type: "AUTH_LOGOUT_FAILURE", payload: authError });
      }
    },
    [createAuthError]
  );

  // =============================================================================
  // User Management
  // =============================================================================

  const updateUser = useCallback(
    async (userData: Partial<UserProfile>) => {
      try {
        const updatedUser = await authApi.updateCurrentUser(userData);

        // Update storage
        authStorage.setUserData(updatedUser);

        dispatch({ type: "AUTH_UPDATE_USER", payload: updatedUser });
      } catch (error: any) {
        const authError = createAuthError(
          error.message || "Failed to update user",
          AUTH_ERRORS.UNKNOWN_ERROR
        );
        setError(authError);
      }
    },
    [createAuthError, setError]
  );

  // =============================================================================
  // Password Management
  // =============================================================================

  const changePassword = useCallback(
    async (data: PasswordChangeFormData) => {
      try {
        await authApi.changePassword({
          current_password: data.current_password,
          new_password: data.new_password,
          confirm_password: data.confirm_password,
        });
      } catch (error: any) {
        const authError = createAuthError(
          error.message || "Password change failed",
          AUTH_ERRORS.UNKNOWN_ERROR
        );
        throw authError;
      }
    },
    [createAuthError]
  );

  const requestPasswordReset = useCallback(
    async (data: PasswordResetFormData) => {
      try {
        await authApi.requestPasswordReset({ email: data.email });
      } catch (error: any) {
        const authError = createAuthError(
          error.message || "Password reset request failed",
          AUTH_ERRORS.UNKNOWN_ERROR
        );
        throw authError;
      }
    },
    [createAuthError]
  );

  const confirmPasswordReset = useCallback(
    async (data: PasswordResetConfirmFormData) => {
      try {
        await authApi.confirmPasswordReset({
          token: data.token,
          new_password: data.new_password,
          confirm_password: data.confirm_password,
        });
      } catch (error: any) {
        const authError = createAuthError(
          error.message || "Password reset confirmation failed",
          AUTH_ERRORS.UNKNOWN_ERROR
        );
        throw authError;
      }
    },
    [createAuthError]
  );

  // =============================================================================
  // Email Verification
  // =============================================================================

  const requestEmailVerification = useCallback(
    async (data: EmailVerificationFormData) => {
      try {
        await authApi.requestEmailVerification({ email: data.email });
      } catch (error: any) {
        const authError = createAuthError(
          error.message || "Email verification request failed",
          AUTH_ERRORS.UNKNOWN_ERROR
        );
        throw authError;
      }
    },
    [createAuthError]
  );

  const confirmEmailVerification = useCallback(
    async (data: EmailVerificationConfirmFormData) => {
      try {
        await authApi.confirmEmailVerification({ token: data.token });

        // Refresh user data to get updated email verification status
        if (state.user) {
          const updatedUser = await authApi.getCurrentUser();
          authStorage.setUserData(updatedUser);
          dispatch({ type: "AUTH_UPDATE_USER", payload: updatedUser });
        }
      } catch (error: any) {
        const authError = createAuthError(
          error.message || "Email verification failed",
          AUTH_ERRORS.UNKNOWN_ERROR
        );
        throw authError;
      }
    },
    [createAuthError, state.user]
  );

  // =============================================================================
  // Session Management
  // =============================================================================

  const getSessions = useCallback(async () => {
    try {
      const response = await authApi.getUserSessions();
      dispatch({ type: "AUTH_UPDATE_SESSIONS", payload: response.sessions });
    } catch (error: any) {
      const authError = createAuthError(
        error.message || "Failed to get sessions",
        AUTH_ERRORS.UNKNOWN_ERROR
      );
      setError(authError);
    }
  }, [createAuthError, setError]);

  const revokeSessions = useCallback(
    async (sessionIds?: number[], revokeAll = false) => {
      try {
        await authApi.revokeSessions({
          session_id: sessionIds?.[0],
          revoke_all: revokeAll,
        });

        // Refresh sessions list
        await getSessions();
      } catch (error: any) {
        const authError = createAuthError(
          error.message || "Failed to revoke sessions",
          AUTH_ERRORS.UNKNOWN_ERROR
        );
        setError(authError);
      }
    },
    [createAuthError, setError, getSessions]
  );

  // =============================================================================
  // Availability Checks
  // =============================================================================

  const checkUsernameAvailability = useCallback(async (username: string) => {
    return authApi.checkUsernameAvailability(username);
  }, []);

  const checkEmailAvailability = useCallback(async (email: string) => {
    return authApi.checkEmailAvailability(email);
  }, []);

  // =============================================================================
  // Social Authentication
  // =============================================================================

  const loginWithSocial = useCallback(async (provider: 'google' | 'github') => {
    try {
      dispatch({ type: "AUTH_LOGIN_START" });
      
      // Get OAuth URL from backend
      const { url } = await authApi.getSocialAuthUrl(provider);
      
      // Open OAuth popup
      const popup = window.open(
        url,
        `${provider}_auth`,
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        const { type, data, error } = event.data;
        
        if (type === 'SOCIAL_AUTH_SUCCESS') {
          popup.close();
          
          // Store auth data
          authStorage.setAuthData({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            tokenExpiry: Date.now() + (data.expires_in * 1000),
            expiresAt: new Date(Date.now() + (data.expires_in * 1000)).toISOString(),
            user: data.user,
            permissions: data.permissions,
          });

          dispatch({
            type: "AUTH_LOGIN_SUCCESS",
            payload: {
              user: data.user,
              permissions: data.permissions,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              tokenExpiry: Date.now() + (data.expires_in * 1000),
            },
          });

          // Schedule token refresh
          scheduleTokenRefresh();
          
          window.removeEventListener('message', handleMessage);
        } else if (type === 'SOCIAL_AUTH_ERROR') {
          popup.close();
          
          const authError = createAuthError(
            error || `${provider} authentication failed`,
            AUTH_ERRORS.INVALID_CREDENTIALS
          );
          
          dispatch({ type: "AUTH_LOGIN_FAILURE", payload: authError });
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          
          // Don't dispatch error if already handled
          if (state.isLoading) {
            const authError = createAuthError(
              'Authentication cancelled',
              AUTH_ERRORS.UNKNOWN_ERROR
            );
            dispatch({ type: "AUTH_LOGIN_FAILURE", payload: authError });
          }
        }
      }, 1000);

    } catch (error: any) {
      const authError = createAuthError(
        error.message || `${provider} authentication failed`,
        AUTH_ERRORS.INVALID_CREDENTIALS
      );
      dispatch({ type: "AUTH_LOGIN_FAILURE", payload: authError });
    }
  }, [createAuthError, scheduleTokenRefresh, state.isLoading]);

  // =============================================================================
  // Initialization
  // =============================================================================

  const initializeAuth = useCallback(async () => {
    dispatch({ type: "AUTH_INITIALIZE_START" });

    try {
      // Check if we have stored auth data
      const storedData = authStorage.getAuthData();

      if (!storedData || authStorage.isTokenExpired()) {
        // No valid stored data - silently initialize as unauthenticated
        dispatch({ type: "AUTH_INITIALIZE_SUCCESS", payload: null });
        return;
      }

      // Validate token with server
      const validation = await authApi.validateToken();

      if (!validation.valid || !validation.user) {
        // Token is invalid - silently clear and initialize as unauthenticated
        authStorage.clearAll();
        dispatch({ type: "AUTH_INITIALIZE_SUCCESS", payload: null });
        return;
      }

      // Update stored user data if needed
      authStorage.setUserData(validation.user);

      dispatch({
        type: "AUTH_INITIALIZE_SUCCESS",
        payload: {
          user: validation.user,
          permissions: storedData.permissions,
        },
      });

      // Schedule token refresh
      scheduleTokenRefresh();
    } catch (error: any) {
      // Network error during initialization - silently clear and initialize as unauthenticated
      authStorage.clearAll();
      dispatch({ type: "AUTH_INITIALIZE_SUCCESS", payload: null });
    }
  }, [createAuthError, scheduleTokenRefresh]);

  // =============================================================================
  // Effects
  // =============================================================================

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    scheduleTokenRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  // =============================================================================
  // Context Value
  // =============================================================================

  const contextValue: AuthContextType = {
    // State
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    user: state.user,
    permissions: state.permissions,
    sessions: state.sessions,
    error: state.error,
    requireEmailVerification: state.requireEmailVerification,
    allowRegistration: state.allowRegistration,
    allowPasswordReset: state.allowPasswordReset,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
    requestEmailVerification,
    confirmEmailVerification,
    getSessions,
    revokeSessions,
    loginWithSocial,

    // Utilities
    clearError,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    checkUsernameAvailability,
    checkEmailAvailability,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// =============================================================================
// Hooks
// =============================================================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const usePermissions = () => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    permissions,
    user,
  } = useAuth();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    permissions,
    user,
  };
};
