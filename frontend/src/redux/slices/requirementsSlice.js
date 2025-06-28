import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const fetchRequirements = createAsyncThunk(
  'requirements/fetchAll',
  async ({ page = 1, limit = 10, search = '', status = '', project = '' }) => {
    const response = await axios.get(`${API_URL}/requirements`, {
      params: {
        page,
        limit,
        search,
        status,
        project,
      },
    });
    return response.data;
  }
);

export const fetchRequirementById = createAsyncThunk(
  'requirements/fetchById',
  async (id) => {
    const response = await axios.get(`${API_URL}/requirements/${id}`);
    return response.data;
  }
);

export const createRequirement = createAsyncThunk(
  'requirements/create',
  async (requirement) => {
    const response = await axios.post(`${API_URL}/requirements`, requirement);
    return response.data;
  }
);

export const updateRequirement = createAsyncThunk(
  'requirements/update',
  async ({ id, requirement }) => {
    const response = await axios.put(`${API_URL}/requirements/${id}`, requirement);
    return response.data;
  }
);

export const deleteRequirement = createAsyncThunk(
  'requirements/delete',
  async (id) => {
    await axios.delete(`${API_URL}/requirements/${id}`);
    return id;
  }
);

const initialState = {
  requirements: [],
  currentRequirement: null,
  totalCount: 0,
  loading: false,
  error: null,
};

const requirementsSlice = createSlice({
  name: 'requirements',
  initialState,
  reducers: {
    clearCurrentRequirement: (state) => {
      state.currentRequirement = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all requirements
      .addCase(fetchRequirements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequirements.fulfilled, (state, action) => {
        state.loading = false;
        state.requirements = action.payload.requirements;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchRequirements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch requirement by ID
      .addCase(fetchRequirementById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequirementById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequirement = action.payload;
      })
      .addCase(fetchRequirementById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create requirement
      .addCase(createRequirement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequirement.fulfilled, (state, action) => {
        state.loading = false;
        state.requirements.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createRequirement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update requirement
      .addCase(updateRequirement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRequirement.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.requirements.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requirements[index] = action.payload;
        }
        state.currentRequirement = action.payload;
      })
      .addCase(updateRequirement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete requirement
      .addCase(deleteRequirement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRequirement.fulfilled, (state, action) => {
        state.loading = false;
        state.requirements = state.requirements.filter((r) => r.id !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(deleteRequirement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentRequirement, clearError } = requirementsSlice.actions;
export default requirementsSlice.reducer; 