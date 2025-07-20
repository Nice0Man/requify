import { createSlice } from "@reduxjs/toolkit";

interface ProjectManagementState {
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectManagementState = {
  isLoading: false,
  error: null,
};

const projectManagementSlice = createSlice({
  name: "projectManagement",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = projectManagementSlice.actions;
export { projectManagementSlice };
