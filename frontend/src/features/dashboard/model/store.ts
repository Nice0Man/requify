import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '../api';

interface DashboardStats {
  totalProjects: number;
  totalRequirements: number;
  totalReleases: number;
  totalTestCases: number;
  activeProjects: number;
  completedProjects: number;
  pendingRequirements: number;
  completedRequirements: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  recentActivity: any[];
  chartData: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  recentActivity: [],
  chartData: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchRecentActivity',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getActivity();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChartData = createAsyncThunk(
  'dashboard/fetchChartData',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: добавить метод getChartData в dashboardApi
      const response = await dashboardApi.getStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload as any;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch recent activity
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.recentActivity = action.payload;
      })
      // Fetch chart data
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.chartData = action.payload as any;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export { dashboardSlice }; 
