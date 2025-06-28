import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Моковые данные для тестирования
const mockReleases = [
  {
    id: 1,
    version: '1.0.0',
    name: 'Initial Release',
    description: 'First stable release of the application',
    status: 'RELEASED',
    releaseDate: '2024-03-15',
    projectId: 1,
    requirements: [1, 2, 3],
    changes: [
      {
        id: 1,
        type: 'FEATURE',
        description: 'User authentication system',
        requirementId: 1
      },
      {
        id: 2,
        type: 'FEATURE',
        description: 'Project management dashboard',
        requirementId: 2
      },
      {
        id: 3,
        type: 'FIX',
        description: 'Fixed login page layout issues',
        requirementId: 3
      }
    ]
  },
  {
    id: 2,
    version: '1.1.0',
    name: 'Feature Update',
    description: 'Added new features and improvements',
    status: 'PLANNED',
    releaseDate: '2024-04-01',
    projectId: 1,
    requirements: [4, 5],
    changes: [
      {
        id: 4,
        type: 'FEATURE',
        description: 'Advanced search functionality',
        requirementId: 4
      },
      {
        id: 5,
        type: 'IMPROVEMENT',
        description: 'Enhanced performance of data loading',
        requirementId: 5
      }
    ]
  },
  {
    id: 3,
    version: '1.0.1',
    name: 'Bug Fix Release',
    description: 'Critical bug fixes and security updates',
    status: 'IN_PROGRESS',
    releaseDate: '2024-03-20',
    projectId: 2,
    requirements: [6],
    changes: [
      {
        id: 6,
        type: 'FIX',
        description: 'Fixed security vulnerability in API endpoints',
        requirementId: 6
      }
    ]
  }
];

export const fetchReleases = createAsyncThunk(
  'releases/fetchAll',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockReleases;
  }
);

export const fetchReleaseById = createAsyncThunk(
  'releases/fetchById',
  async (id) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const release = mockReleases.find(r => r.id === parseInt(id));
    if (!release) {
      throw new Error('Release not found');
    }
    return release;
  }
);

export const createRelease = createAsyncThunk(
  'releases/create',
  async (releaseData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newRelease = {
      id: Date.now(),
      ...releaseData,
      changes: [],
      requirements: []
    };
    return newRelease;
  }
);

export const updateRelease = createAsyncThunk(
  'releases/update',
  async (releaseData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return releaseData;
  }
);

export const deleteRelease = createAsyncThunk(
  'releases/delete',
  async (id) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return id;
  }
);

const initialState = {
  releases: [],
  currentRelease: null,
  loading: false,
  error: null,
};

const releasesSlice = createSlice({
  name: 'releases',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRelease: (state, action) => {
      state.currentRelease = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Releases
      .addCase(fetchReleases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReleases.fulfilled, (state, action) => {
        state.loading = false;
        state.releases = action.payload;
      })
      .addCase(fetchReleases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Release by ID
      .addCase(fetchReleaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReleaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRelease = action.payload;
      })
      .addCase(fetchReleaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Release
      .addCase(createRelease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRelease.fulfilled, (state, action) => {
        state.loading = false;
        state.releases.push(action.payload);
      })
      .addCase(createRelease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update Release
      .addCase(updateRelease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRelease.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.releases.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.releases[index] = action.payload;
        }
        if (state.currentRelease?.id === action.payload.id) {
          state.currentRelease = action.payload;
        }
      })
      .addCase(updateRelease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete Release
      .addCase(deleteRelease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRelease.fulfilled, (state, action) => {
        state.loading = false;
        state.releases = state.releases.filter(r => r.id !== action.payload);
        if (state.currentRelease?.id === action.payload) {
          state.currentRelease = null;
        }
      })
      .addCase(deleteRelease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, setCurrentRelease } = releasesSlice.actions;
export default releasesSlice.reducer; 