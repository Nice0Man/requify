import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "@/entities/user";
import { authApi } from "../api/auth.api";
import { RegisterData } from "@/shared/hooks/useAuth";
import { authStorage } from "./auth.storage";

// Типы для Auth state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
  lastLoginAt: string | null;
}

// Начальное состояние
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: [],
  lastLoginAt: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginData, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);

      // Сохраняем данные в localStorage
      authStorage.setAuthData({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user: response.user,
        permissions: response.permissions || [],
        expiresAt: response.expires_in,
      });

      return {
        user: response.user,
        permissions: response.permissions || [],
        lastLoginAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      authStorage.clearAuthData();
      return null;
    } catch (error: any) {
      // Всегда очищаем локальные данные, даже если API запрос не удался
      authStorage.clearAuthData();
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.refreshToken(
        authStorage.getAuthData()?.refreshToken
      );

      // Обновляем данные в localStorage
      const currentData = authStorage.getAuthData();
      if (currentData) {
        authStorage.setAuthData({
          ...currentData,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          expiresAt: response.expires_in,
        });
      }

      return response;
    } catch (error: any) {
      authStorage.clearAuthData();
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed"
      );
    }
  }
);

export const validateToken = createAsyncThunk(
  "auth/validate",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.validateToken();
      return response;
    } catch (error: any) {
      authStorage.clearAuthData();
      return rejectWithValue(
        error.response?.data?.message || "Token validation failed"
      );
    }
  }
);

// Slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Синхронные actions
    clearError: (state) => {
      state.error = null;
    },

    // Инициализация аутентификации из localStorage
    initializeAuth: (state) => {
      const storedData = authStorage.getAuthData();
      if (storedData && !authStorage.isTokenExpired()) {
        state.user = storedData.user;
        state.isAuthenticated = true;
        state.permissions = storedData.permissions || [];
        state.lastLoginAt = storedData.expiresAt;
      }
    },

    // Обновить данные пользователя
    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };

        // Обновляем данные в localStorage
        const currentData = authStorage.getAuthData();
        if (currentData) {
          authStorage.setAuthData({
            ...currentData,
            user: state.user,
          });
        }
      }
    },

    // Обновить разрешения
    updatePermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;

      // Обновляем данные в localStorage
      const currentData = authStorage.getAuthData();
      if (currentData) {
        authStorage.setAuthData({
          ...currentData,
          permissions: action.payload,
        });
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user as unknown as User;
        state.permissions = action.payload.permissions;
        state.lastLoginAt = action.payload.lastLoginAt;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.permissions = [];
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        // После регистрации пользователь не авторизован автоматически
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.permissions = [];
        state.lastLoginAt = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Даже если logout не удался, очищаем локальное состояние
        state.isAuthenticated = false;
        state.user = null;
        state.permissions = [];
        state.lastLoginAt = null;
        state.error = action.payload as string;
      });

    // Refresh token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        // Токен обновлен, состояние аутентификации сохраняется
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.permissions = [];
        state.lastLoginAt = null;
        state.error = action.payload as string;
      });

    // Validate token
    builder
      .addCase(validateToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(validateToken.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        // Токен валиден, состояние аутентификации сохраняется
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.permissions = [];
        state.lastLoginAt = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, initializeAuth, updateUserData, updatePermissions } =
  authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectPermissions = (state: { auth: AuthState }) =>
  state.auth.permissions;
export const selectLastLoginAt = (state: { auth: AuthState }) =>
  state.auth.lastLoginAt;

export default authSlice.reducer;
