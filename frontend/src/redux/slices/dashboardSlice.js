import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Моковые данные для тестирования
const mockStats = {
  totalRequirements: 25,
  activeProjects: 8,
  inTesting: 12,
  completed: 15
};

const mockActivities = [
  {
    id: 1,
    description: 'New requirement "User Authentication" created',
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    description: 'Project "Mobile App" status updated to "In Progress"',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    description: 'Requirement "Payment Integration" marked as completed',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      stats: mockStats,
      recentActivities: mockActivities
    };
  }
);

const initialState = {
  stats: mockStats,
  recentActivities: mockActivities,
  loading: false,
  error: null,
};

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
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.recentActivities = action.payload.recentActivities;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer; 