import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { UserProfile } from '@/entities/user';
import { authApi } from '../api/auth.api';
import { authStorage } from './auth.storage';
import type {
  AuthState,
  AuthContextType,
  AuthAction,
  AuthError,
  LoginFormData,
  RegisterFormData,
  PasswordChangeFormData,
  PasswordResetFormData
} from './auth.types';

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
    case 'AUTH_INITIALIZE_START':
      return { ...state, isLoading: true, error: null };

    case 'AUTH_INITIALIZE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: true,
        user: action.payload.user,
        permissions: action.payload.permissions,
        error: null,
      };

    case 'AUTH_INITIALIZE_FAILURE':
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

    case 'AUTH_LOGIN_START':
    case 'AUTH_REGISTER_START':
      return { ...state, isLoading: true, error: null };

    case 'AUTH_LOGIN_SUCCESS':
    case 'AUTH_REGISTER_SUCCESS':
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

    case 'AUTH_LOGIN_FAILURE':
    case 'AUTH_REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        permissions: [],
        error: action.payload,
      };

    case 'AUTH_LOGOUT_START':
      return { ...state, isLoading: true, error: null };

    case 'AUTH_LOGOUT_SUCCESS':
      return { ...initialState, isInitialized: true, isLoading: false };

    case 'AUTH_LOGOUT_FAILURE':
      return { ...state, isLoading: false, error: action.payload };

    case 'AUTH_REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        accessToken: action.payload.accessToken,
        tokenExpiry: action.payload.tokenExpiry,
        error: null,
      };

    case 'AUTH_REFRESH_TOKEN_FAILURE':
      return { ...initialState, isInitialized: true, error: action.payload };

    case 'AUTH_UPDATE_USER':
      return { ...state, user: action.payload };

    case 'AUTH_UPDATE_PERMISSIONS':
      return { ...state, permissions: action.payload };

    case 'AUTH_UPDATE_SESSIONS':
      return { ...state, sessions: action.payload };

    case 'AUTH_CLEAR_ERROR':
      return { ...state, error: null };

    case 'AUTH_SET_ERROR':
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
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);

  const setError = useCallback((error: AuthError) => {
    dispatch({ type: 'AUTH_SET_ERROR', payload: error });
  }, []);

  const updateUser = useCallback((user: UserProfile) => {
    dispatch({ type: 'AUTH_UPDATE_USER', payload: user });
  }, []);

  const updatePermissions = useCallback((permissions: string[]) => {
    dispatch({ type: 'AUTH_UPDATE_PERMISSIONS', payload: permissions });
  }, []);

  // =============================================================================
  // Permission Helpers
  // =============================================================================

  const hasPermission = useCallback((permission: string): boolean => {
    return state.permissions.includes(permission);
  }, [state.permissions]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => state.permissions.includes(permission));
  }, [state.permissions]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => state.permissions.includes(permission));
  }, [state.permissions]);

  // =============================================================================
  // Authentication Methods
  // =============================================================================

  const login = useCallback(async (credentials: LoginFormData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_LOGIN_START' });
      
      const response = await authApi.login(credentials);
      const { access_token, refresh_token, expires_in, user } = response;
      
      const tokenExpiry = new Date(Date.now() + expires_in * 1000);
      
      // Store tokens in storage
      authStorage.setTokens(access_token, refresh_token, expires_in);
      if (credentials.remember_me) {
        authStorage.setRememberMe(true);
      }
      
      // TODO: Get user permissions from API
      const permissions: string[] = [];
      
      dispatch({
        type: 'AUTH_LOGIN_SUCCESS',
        payload: {
          user,
          permissions,
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiry,
        },
      });
    } catch (error) {
      const authError: AuthError = {
        type: 'authentication',
        message: error instanceof Error ? error.message : 'Login error',
      };
      
      dispatch({ type: 'AUTH_LOGIN_FAILURE', payload: authError });
      throw authError;
    }
  }, []);

  const register = useCallback(async (userData: RegisterFormData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_REGISTER_START' });
      
      const response = await authApi.register(userData);
      const { access_token, refresh_token, expires_in, user } = response;
      
      const tokenExpiry = new Date(Date.now() + expires_in * 1000);
      
      // Store tokens in storage
      authStorage.setTokens(access_token, refresh_token, expires_in);
      
      // TODO: Get user permissions from API
      const permissions: string[] = [];
      
      dispatch({
        type: 'AUTH_REGISTER_SUCCESS',
        payload: {
          user,
          permissions,
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiry,
        },
      });
    } catch (error) {
      const authError: AuthError = {
        type: 'authentication',
        message: error instanceof Error ? error.message : 'Registration error',
      };
      
      dispatch({ type: 'AUTH_REGISTER_FAILURE', payload: authError });
      throw authError;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_LOGOUT_START' });
      
      await authApi.logout();
      
      // Clear tokens from storage
      authStorage.clearTokens();
      authStorage.clearUserData();
      
      // Cancel token auto-refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      dispatch({ type: 'AUTH_LOGOUT_SUCCESS' });
    } catch (error) {
      const authError: AuthError = {
        type: 'authentication',
        message: error instanceof Error ? error.message : 'Logout error',
      };
      
      dispatch({ type: 'AUTH_LOGOUT_FAILURE', payload: authError });
      
      // Force clear data even on error
      authStorage.clearTokens();
      authStorage.clearUserData();
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const currentRefreshToken = authStorage.getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('Refresh token not found');
      }
      
      const response = await authApi.refreshToken(currentRefreshToken);
      const { access_token, expires_in } = response;
      
      const tokenExpiry = new Date(Date.now() + expires_in * 1000);
      
      authStorage.setAccessToken(access_token);
      authStorage.setTokenExpiry(tokenExpiry);
      
      dispatch({
        type: 'AUTH_REFRESH_TOKEN_SUCCESS',
        payload: {
          accessToken: access_token,
          tokenExpiry,
        },
      });
    } catch (error) {
      const authError: AuthError = {
        type: 'authentication',
        message: 'Token refresh error',
      };
      
      authStorage.clearTokens();
      dispatch({ type: 'AUTH_REFRESH_TOKEN_FAILURE', payload: authError });
      throw authError;
    }
  }, []);

  // =============================================================================
  // Auth Validation
  // =============================================================================

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const accessToken = authStorage.getAccessToken();
      if (!accessToken) {
        return false;
      }
      
      if (authStorage.isTokenExpired()) {
        try {
          await refreshToken();
        } catch {
          return false;
        }
      }
      
      const validation = await authApi.validateToken();
      
      if (validation.valid && validation.user) {
        dispatch({
          type: 'AUTH_INITIALIZE_SUCCESS',
          payload: {
            user: validation.user,
            permissions: [], // TODO: get from API
          },
        });
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }, [refreshToken]);

  // =============================================================================
  // Password Management
  // =============================================================================

  const changePassword = useCallback(async (request: PasswordChangeFormData): Promise<void> => {
    try {
      await authApi.changePassword(request);
    } catch (error) {
      const authError: AuthError = {
        type: 'validation',
        message: error instanceof Error ? error.message : 'Password change error',
      };
      throw authError;
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
    try {
      await authApi.requestPasswordReset({ email });
    } catch (error) {
      const authError: AuthError = {
        type: 'validation',
        message: error instanceof Error ? error.message : 'Password reset request error',
      };
      throw authError;
    }
  }, []);

  const confirmPasswordReset = useCallback(async (data: PasswordResetFormData): Promise<void> => {
    try {
      await authApi.confirmPasswordReset(data);
    } catch (error) {
      const authError: AuthError = {
        type: 'validation',
        message: error instanceof Error ? error.message : 'Password reset confirmation error',
      };
      throw authError;
    }
  }, []);

  // =============================================================================
  // Email Verification
  // =============================================================================

  const requestEmailVerification = useCallback(async (email: string): Promise<void> => {
    try {
      await authApi.requestEmailVerification({ email });
    } catch (error) {
      const authError: AuthError = {
        type: 'validation',
        message: error instanceof Error ? error.message : 'Email verification request error',
      };
      throw authError;
    }
  }, []);

  const confirmEmailVerification = useCallback(async (token: string): Promise<void> => {
    try {
      await authApi.confirmEmailVerification({ token });
    } catch (error) {
      const authError: AuthError = {
        type: 'validation',
        message: error instanceof Error ? error.message : 'Email confirmation error',
      };
      throw authError;
    }
  }, []);

  // =============================================================================
  // Session Management
  // =============================================================================

  const refreshUserSessions = useCallback(async (): Promise<void> => {
    try {
      const sessions = await authApi.getUserSessions();
      dispatch({ type: 'AUTH_UPDATE_SESSIONS', payload: sessions });
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }, []);

  const revokeSessions = useCallback(async (sessionIds: string[]): Promise<void> => {
    try {
      await authApi.revokeSessions(sessionIds);
      await refreshUserSessions();
    } catch (error) {
      const authError: AuthError = {
        type: 'server',
        message: error instanceof Error ? error.message : 'Session revocation error',
      };
      throw authError;
    }
  }, [refreshUserSessions]);

  const revokeAllOtherSessions = useCallback(async (): Promise<void> => {
    try {
      await authApi.revokeAllOtherSessions();
      await refreshUserSessions();
    } catch (error) {
      const authError: AuthError = {
        type: 'server',
        message: error instanceof Error ? error.message : 'Session revocation error',
      };
      throw authError;
    }
  }, [refreshUserSessions]);

  // =============================================================================
  // Profile Management
  // =============================================================================

  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<void> => {
    try {
      // TODO: Implement profile update via API
      console.log('Profile update:', data);
    } catch (error) {
      const authError: AuthError = {
        type: 'server',
        message: error instanceof Error ? error.message : 'Profile update error',
      };
      throw authError;
    }
  }, []);

  const refreshUserData = useCallback(async (): Promise<void> => {
    try {
      const user = await authApi.getCurrentUser();
      dispatch({ type: 'AUTH_UPDATE_USER', payload: user });
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, []);

  // =============================================================================
  // Initialization Effect
  // =============================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'AUTH_INITIALIZE_START' });
        const isAuthenticated = await checkAuth();
        
        if (!isAuthenticated) {
          dispatch({
            type: 'AUTH_INITIALIZE_FAILURE',
            payload: {
              type: 'authentication',
              message: 'User is not authenticated',
            },
          });
        }
      } catch (error) {
        dispatch({
          type: 'AUTH_INITIALIZE_FAILURE',
          payload: {
            type: 'authentication',
            message: error instanceof Error ? error.message : 'Initialization error',
          },
        });
      }
    };

    initializeAuth();
  }, [checkAuth]);

  // =============================================================================
  // Context Value
  // =============================================================================

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    refreshToken,
    updateUser,
    updatePermissions,
    clearError,
    setError,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
    requestEmailVerification,
    confirmEmailVerification,
    refreshUserSessions,
    revokeSessions,
    revokeAllOtherSessions,
    updateProfile,
    refreshUserData,
    checkAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  // =============================================================================
  // Provider
  // =============================================================================

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
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