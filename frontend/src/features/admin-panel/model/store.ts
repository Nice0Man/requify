import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdminPanelState {
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminPanelState = {
  isLoading: false,
  error: null,
};

const adminPanelSlice = createSlice({
  name: "adminPanel",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = adminPanelSlice.actions;
export { adminPanelSlice };
