import { createSlice } from "@reduxjs/toolkit";

interface TestManagementState {
  isLoading: boolean;
  error: string | null;
}

const initialState: TestManagementState = {
  isLoading: false,
  error: null,
};

const testManagementSlice = createSlice({
  name: "testManagement",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = testManagementSlice.actions;
export { testManagementSlice };
