import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Моковые данные для тестирования
const mockTests = [
  {
    id: 1,
    name: 'User Authentication Test',
    description: 'Testing user login and registration functionality',
    status: 'PASSED',
    type: 'FUNCTIONAL',
    priority: 'HIGH',
    requirementId: 1,
    projectId: 1,
    releaseId: 1,
    steps: [
      {
        id: 1,
        description: 'Enter valid credentials',
        expectedResult: 'User should be logged in successfully',
        actualResult: 'User logged in successfully',
        status: 'PASSED'
      },
      {
        id: 2,
        description: 'Enter invalid credentials',
        expectedResult: 'User should see error message',
        actualResult: 'Error message displayed correctly',
        status: 'PASSED'
      }
    ],
    createdAt: '2024-03-15T10:00:00',
    updatedAt: '2024-03-15T11:30:00',
    assignedTo: 'John Doe',
    environment: 'STAGING',
    attachments: [
      {
        id: 1,
        name: 'login_screenshot.png',
        type: 'image/png',
        size: '1.2MB'
      }
    ]
  },
  {
    id: 2,
    name: 'Project Creation Test',
    description: 'Testing project creation workflow',
    status: 'FAILED',
    type: 'FUNCTIONAL',
    priority: 'MEDIUM',
    requirementId: 2,
    projectId: 1,
    releaseId: 1,
    steps: [
      {
        id: 3,
        description: 'Fill project details form',
        expectedResult: 'Form should accept valid data',
        actualResult: 'Form validation failed',
        status: 'FAILED'
      }
    ],
    createdAt: '2024-03-15T14:00:00',
    updatedAt: '2024-03-15T15:00:00',
    assignedTo: 'Jane Smith',
    environment: 'DEVELOPMENT',
    attachments: []
  },
  {
    id: 3,
    name: 'Performance Test',
    description: 'Testing application performance under load',
    status: 'IN_PROGRESS',
    type: 'PERFORMANCE',
    priority: 'HIGH',
    requirementId: 3,
    projectId: 2,
    releaseId: 2,
    steps: [
      {
        id: 4,
        description: 'Simulate 1000 concurrent users',
        expectedResult: 'Response time < 2s',
        actualResult: 'Test in progress',
        status: 'IN_PROGRESS'
      }
    ],
    createdAt: '2024-03-16T09:00:00',
    updatedAt: '2024-03-16T09:30:00',
    assignedTo: 'Mike Johnson',
    environment: 'PRODUCTION',
    attachments: []
  }
];

export const fetchTests = createAsyncThunk(
  'testing/fetchAll',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockTests;
  }
);

export const fetchTestById = createAsyncThunk(
  'testing/fetchById',
  async (id) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const test = mockTests.find(t => t.id === parseInt(id));
    if (!test) {
      throw new Error('Test not found');
    }
    return test;
  }
);

export const createTest = createAsyncThunk(
  'testing/create',
  async (testData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newTest = {
      id: Date.now(),
      ...testData,
      steps: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newTest;
  }
);

export const updateTest = createAsyncThunk(
  'testing/update',
  async (testData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ...testData,
      updatedAt: new Date().toISOString()
    };
  }
);

export const deleteTest = createAsyncThunk(
  'testing/delete',
  async (id) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return id;
  }
);

export const addTestStep = createAsyncThunk(
  'testing/addStep',
  async ({ testId, stepData }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const test = mockTests.find(t => t.id === parseInt(testId));
    if (!test) {
      throw new Error('Test not found');
    }
    const newStep = {
      id: Date.now(),
      ...stepData
    };
    return { testId, step: newStep };
  }
);

export const updateTestStep = createAsyncThunk(
  'testing/updateStep',
  async ({ testId, stepId, stepData }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { testId, stepId, stepData };
  }
);

export const deleteTestStep = createAsyncThunk(
  'testing/deleteStep',
  async ({ testId, stepId }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { testId, stepId };
  }
);

const initialState = {
  tests: [],
  currentTest: null,
  loading: false,
  error: null,
};

const testingSlice = createSlice({
  name: 'testing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTest: (state, action) => {
      state.currentTest = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Tests
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Test by ID
      .addCase(fetchTestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTest = action.payload;
      })
      .addCase(fetchTestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Test
      .addCase(createTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTest.fulfilled, (state, action) => {
        state.loading = false;
        state.tests.push(action.payload);
      })
      .addCase(createTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update Test
      .addCase(updateTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tests.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
        if (state.currentTest?.id === action.payload.id) {
          state.currentTest = action.payload;
        }
      })
      .addCase(updateTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete Test
      .addCase(deleteTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTest.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = state.tests.filter(t => t.id !== action.payload);
        if (state.currentTest?.id === action.payload) {
          state.currentTest = null;
        }
      })
      .addCase(deleteTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add Test Step
      .addCase(addTestStep.fulfilled, (state, action) => {
        const { testId, step } = action.payload;
        const test = state.tests.find(t => t.id === testId);
        if (test) {
          test.steps.push(step);
        }
        if (state.currentTest?.id === testId) {
          state.currentTest.steps.push(step);
        }
      })
      // Update Test Step
      .addCase(updateTestStep.fulfilled, (state, action) => {
        const { testId, stepId, stepData } = action.payload;
        const test = state.tests.find(t => t.id === testId);
        if (test) {
          const stepIndex = test.steps.findIndex(s => s.id === stepId);
          if (stepIndex !== -1) {
            test.steps[stepIndex] = { ...test.steps[stepIndex], ...stepData };
          }
        }
        if (state.currentTest?.id === testId) {
          const stepIndex = state.currentTest.steps.findIndex(s => s.id === stepId);
          if (stepIndex !== -1) {
            state.currentTest.steps[stepIndex] = {
              ...state.currentTest.steps[stepIndex],
              ...stepData
            };
          }
        }
      })
      // Delete Test Step
      .addCase(deleteTestStep.fulfilled, (state, action) => {
        const { testId, stepId } = action.payload;
        const test = state.tests.find(t => t.id === testId);
        if (test) {
          test.steps = test.steps.filter(s => s.id !== stepId);
        }
        if (state.currentTest?.id === testId) {
          state.currentTest.steps = state.currentTest.steps.filter(s => s.id !== stepId);
        }
      });
  },
});

export const { clearError, setCurrentTest } = testingSlice.actions;
export default testingSlice.reducer; 