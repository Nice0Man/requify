import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardApi } from "../api/dashboard.api";

// Типы для dashboard state
export interface DashboardStats {
  projectsCount: number;
  requirementsCount: number;
  releasesCount: number;
  testsCount: number;
  completedRequirements: number;
  inProgressRequirements: number;
  pendingRequirements: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: "project" | "requirement" | "release" | "test";
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface DashboardState {
  stats: DashboardStats | null;
  myProjects: any[];
  myRequirements: any[];
  myActivity: ActivityItem[];
  notifications: any[];
  isLoading: boolean;
  isStatsLoading: boolean;
  isActivityLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Начальное состояние
const initialState: DashboardState = {
  stats: null,
  myProjects: [],
  myRequirements: [],
  myActivity: [],
  notifications: [],
  isLoading: false,
  isStatsLoading: false,
  isActivityLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard stats"
      );
    }
  }
);

export const fetchMyProjects = createAsyncThunk(
  "dashboard/fetchMyProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getMyProjects();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch my projects"
      );
    }
  }
);

export const fetchMyRequirements = createAsyncThunk(
  "dashboard/fetchMyRequirements",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getMyRequirements();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch my requirements"
      );
    }
  }
);

export const fetchMyActivity = createAsyncThunk(
  "dashboard/fetchMyActivity",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getActivity();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch my activity"
      );
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  "dashboard/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getNotifications();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

export const refreshDashboard = createAsyncThunk(
  "dashboard/refresh",
  async (_, { dispatch }) => {
    // Обновляем все данные параллельно
    const promises = [
      dispatch(fetchDashboardStats()),
      dispatch(fetchMyProjects()),
      dispatch(fetchMyRequirements()),
      dispatch(fetchMyActivity()),
      dispatch(fetchNotifications()),
    ];

    await Promise.all(promises);
    return Date.now();
  }
);

// Slice
export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Синхронные actions
    clearError: (state) => {
      state.error = null;
    },

    // Добавить новое уведомление
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.unshift(action.payload);
    },

    // Отметить уведомление как прочитанное
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.isRead = true;
      }
    },

    // Удалить уведомление
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    // Обновить статистику локально
    updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },

    // Добавить активность
    addActivity: (state, action: PayloadAction<ActivityItem>) => {
      state.myActivity.unshift(action.payload);
      // Ограничиваем количество записей активности
      if (state.myActivity.length > 50) {
        state.myActivity = state.myActivity.slice(0, 50);
      }
    },

    // Сбросить состояние дашборда
    resetDashboard: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Dashboard stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isStatsLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isStatsLoading = false;
        state.stats = action.payload as unknown as DashboardStats;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isStatsLoading = false;
        state.error = action.payload as string;
      });

    // My projects
    builder
      .addCase(fetchMyProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProjects = action.payload;
      })
      .addCase(fetchMyProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // My requirements
    builder
      .addCase(fetchMyRequirements.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyRequirements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRequirements = action.payload;
      })
      .addCase(fetchMyRequirements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // My activity
    builder
      .addCase(fetchMyActivity.pending, (state) => {
        state.isActivityLoading = true;
      })
      .addCase(fetchMyActivity.fulfilled, (state, action) => {
        state.isActivityLoading = false;
        state.myActivity = action.payload as unknown as ActivityItem[];
      })
      .addCase(fetchMyActivity.rejected, (state, action) => {
        state.isActivityLoading = false;
        state.error = action.payload as string;
      });

    // Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh dashboard
    builder
      .addCase(refreshDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshDashboard.fulfilled, (state) => {
        state.isLoading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  updateStats,
  addActivity,
  resetDashboard,
} = dashboardSlice.actions;

// Selectors
export const selectDashboard = (state: { dashboard: DashboardState }) =>
  state.dashboard;
export const selectDashboardStats = (state: { dashboard: DashboardState }) =>
  state.dashboard.stats;
export const selectMyProjects = (state: { dashboard: DashboardState }) =>
  state.dashboard.myProjects;
export const selectMyRequirements = (state: { dashboard: DashboardState }) =>
  state.dashboard.myRequirements;
export const selectMyActivity = (state: { dashboard: DashboardState }) =>
  state.dashboard.myActivity;
export const selectNotifications = (state: { dashboard: DashboardState }) =>
  state.dashboard.notifications;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.isLoading;
export const selectDashboardError = (state: { dashboard: DashboardState }) =>
  state.dashboard.error;
export const selectLastUpdated = (state: { dashboard: DashboardState }) =>
  state.dashboard.lastUpdated;

export default dashboardSlice.reducer;
