import { createSlice } from "@reduxjs/toolkit";

interface AdminPanelState {
  isLoading: boolean;
  error: string | null;
  users?: any[];
  systemSettings?: any;
  auditLogs?: any[];
}

const initialState: AdminPanelState = {
  isLoading: false,
  error: null,
  users: [],
  systemSettings: null,
  auditLogs: [],
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
