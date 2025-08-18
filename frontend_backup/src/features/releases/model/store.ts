import { createSlice } from "@reduxjs/toolkit";

interface ReleaseManagementState {
  isLoading: boolean;
  error: string | null;
}

const initialState: ReleaseManagementState = {
  isLoading: false,
  error: null,
};

const releaseManagementSlice = createSlice({
  name: "releaseManagement",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = releaseManagementSlice.actions;
export { releaseManagementSlice };
