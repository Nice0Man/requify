import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NotificationManagementState {
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationManagementState = {
  isLoading: false,
  error: null,
};

const notificationManagementSlice = createSlice({
  name: "notificationManagement",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = notificationManagementSlice.actions;
export { notificationManagementSlice };
