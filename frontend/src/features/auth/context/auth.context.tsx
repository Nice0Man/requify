import React, { createContext, useContext, useCallback, useEffect, useReducer } from 'react';
import { toast } from 'react-toastify';
import { authApi } from '../api/auth.api';
import { apiClient } from '@/shared/api/client';
import { 
  AuthState, 
  UserProfile, 
  LoginRequest, 
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  AuthError 
} from '../types/auth.types';

// Auth context type
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenMethod: () => Promise<string | null>;
  changePassword: (request: PasswordChangeRequest) => Promise<void>;
  requestPasswordReset: (request: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (request: PasswordResetConfirm) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

// Auth reducer actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: UserProfile; accessToken: string; refreshToken: string; permissions: string[] } }
  | { type: 'AUTH_FAILURE'; payload: AuthError }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'TOKEN_REFRESH_SUCCESS'; payload: { accessToken: string } }
  | { type: 'PROFILE_UPDATE_SUCCESS'; payload: UserProfile }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: [],
  sessions: []
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'AUTH_SUCCESS':
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('permissions', JSON.stringify(action.payload.permissions));
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        permissions: action.payload.permissions,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case 'AUTH_FAILURE':
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('permissions');
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case 'AUTH_LOGOUT':
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('permissions');
      return {
        ...initialState,
        accessToken: null,
        refreshToken: null
      };

    case 'TOKEN_REFRESH_SUCCESS':
      localStorage.setItem('accessToken', action.payload.accessToken);
      return {
        ...state,
        accessToken: action.payload.accessToken,
        error: null
      };

    case 'PROFILE_UPDATE_SUCCESS':
      return {
        ...state,
        user: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token manager implementation
class AuthTokenManager {
  constructor(private dispatch: React.Dispatch<AuthAction>, private refreshTokenValue: string | null) {}

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.refreshTokenValue || localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken({ refresh_token: refreshToken });
      
      this.dispatch({
        type: 'TOKEN_REFRESH_SUCCESS',
        payload: { accessToken: response.data.access_token }
      });

      return response.data.access_token;
    } catch (error) {
      this.dispatch({ type: 'AUTH_LOGOUT' });
      return null;
    }
  }

  clearTokens(): void {
    this.dispatch({ type: 'AUTH_LOGOUT' });
  }
}

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      dispatch({ type: 'AUTH_START' });
      
      const response = await authApi.login(credentials);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          permissions: response.data.permissions
        }
      });

      toast.success('Login successful');
    } catch (error: any) {
      const authError: AuthError = {
        error: error.code || 'LOGIN_FAILED',
        error_description: error.message || 'Login failed',
        error_details: error.details
      };
      
      dispatch({ type: 'AUTH_FAILURE', payload: authError });
      toast.error(authError.error_description);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
      toast.info('Logged out successfully');
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      if (!state.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken({ refresh_token: state.refreshToken });
      
      dispatch({
        type: 'TOKEN_REFRESH_SUCCESS',
        payload: { accessToken: response.data.access_token }
      });

      return response.data.access_token;
    } catch (error) {
      dispatch({ type: 'AUTH_LOGOUT' });
      return null;
    }
  }, [state.refreshToken]);

  const changePassword = useCallback(async (request: PasswordChangeRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authApi.changePassword(request);
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const requestPasswordReset = useCallback(async (request: PasswordResetRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authApi.requestPasswordReset(request);
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to request password reset');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const confirmPasswordReset = useCallback(async (request: PasswordResetConfirm) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authApi.confirmPasswordReset(request);
      toast.success('Password reset successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authApi.updateProfile(data);
      
      dispatch({ 
        type: 'PROFILE_UPDATE_SUCCESS', 
        payload: response.data 
      });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');

      if (!accessToken || !refreshToken) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Validate token and get current user
      const response = await authApi.validateToken();
      
      if (response.data.valid && response.data.user) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            accessToken,
            refreshToken,
            permissions
          }
        });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshTokenMethod: refreshToken,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
    updateProfile,
    clearError,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Permission checking hook
export const usePermissions = () => {
  const { permissions } = useAuth();

  const hasPermission = useCallback((permission: string): boolean => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  }, [permissions]);

  const hasAllPermissions = useCallback((requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  }, [permissions]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasPermissions: hasAllPermissions // Alias for backward compatibility
  };
}; 