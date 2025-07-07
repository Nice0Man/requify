import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RequirementManagementState {
  isLoading: boolean;
  error: string | null;
}

const initialState: RequirementManagementState = {
  isLoading: false,
  error: null,
};

const requirementManagementSlice = createSlice({
  name: "requirementManagement",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = requirementManagementSlice.actions;
export { requirementManagementSlice };
