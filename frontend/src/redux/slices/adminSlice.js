import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Моковые данные для тестирования
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    firstName: 'Admin',
    lastName: 'User',
    department: 'IT',
    lastLogin: '2024-03-16T10:00:00',
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@example.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    firstName: 'Project',
    lastName: 'Manager',
    department: 'Project Management',
    lastLogin: '2024-03-15T15:30:00',
    createdAt: '2024-01-02T00:00:00',
  },
  {
    id: 3,
    username: 'tester',
    email: 'tester@example.com',
    role: 'TESTER',
    status: 'ACTIVE',
    firstName: 'QA',
    lastName: 'Engineer',
    department: 'Quality Assurance',
    lastLogin: '2024-03-16T09:15:00',
    createdAt: '2024-01-03T00:00:00',
  },
];

const mockSettings = {
  system: {
    name: 'Requify',
    version: '1.0.0',
    environment: 'PRODUCTION',
    maintenanceMode: false,
    maxFileSize: 10, // MB
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'],
  },
  notifications: {
    emailNotifications: true,
    slackNotifications: false,
    notificationTypes: ['REQUIREMENT_UPDATED', 'TEST_FAILED', 'RELEASE_CREATED'],
  },
  security: {
    passwordExpiryDays: 90,
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 30,
    twoFactorAuth: false,
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'DAILY',
    retentionDays: 30,
    lastBackup: '2024-03-16T00:00:00',
  },
};

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockUsers;
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser = {
      id: Date.now(),
      ...userData,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    return newUser;
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return userData;
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return id;
  }
);

export const fetchSettings = createAsyncThunk(
  'admin/fetchSettings',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockSettings;
  }
);

export const updateSettings = createAsyncThunk(
  'admin/updateSettings',
  async (settings) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return settings;
  }
);

const initialState = {
  users: [],
  settings: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update Settings
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer; 