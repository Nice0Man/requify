import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Моковые данные для тестирования
const mockProjects = [
  {
    id: 1,
    name: 'Mobile App Development',
    description: 'Development of a new mobile application for iOS and Android',
    status: 'IN_PROGRESS',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    requirements: [1, 2, 3],
    team: ['John Doe', 'Jane Smith'],
  },
  {
    id: 2,
    name: 'Website Redesign',
    description: 'Complete redesign of the company website',
    status: 'PLANNING',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    requirements: [4, 5],
    team: ['Mike Johnson'],
  },
  {
    id: 3,
    name: 'API Integration',
    description: 'Integration with third-party APIs',
    status: 'COMPLETED',
    startDate: '2023-12-01',
    endDate: '2024-01-31',
    requirements: [6],
    team: ['Sarah Wilson'],
  },
];

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async () => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockProjects;
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchById',
  async (id) => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    const project = mockProjects.find(p => p.id === parseInt(id));
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData) => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newProject = {
      id: Date.now(),
      ...projectData,
      requirements: [],
      team: [],
    };
    return newProject;
  }
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async (projectData) => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    return projectData;
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id) => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    return id;
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentProject, clearError, setCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer; 