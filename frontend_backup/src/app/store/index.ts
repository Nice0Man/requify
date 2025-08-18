import { configureStore } from "@reduxjs/toolkit";
import { dashboardSlice } from "@/features/dashboard/model/store";
import { projectManagementSlice } from "@/features/projects/model/store";
import { requirementManagementSlice } from "@/features/requirements/model/store";
import { releaseManagementSlice } from "@/features/releases/model/store";
import { testManagementSlice } from "@/features/testing/model/store";
import { navigationSlice } from "@/features/navigation/model/store";
import { notificationManagementSlice } from "@/features/notifications/model/store";
import { adminPanelSlice } from "@/features/admin/model/store";

export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice.reducer,
    projectManagement: projectManagementSlice.reducer,
    requirementManagement: requirementManagementSlice.reducer,
    releaseManagement: releaseManagementSlice.reducer,
    testManagement: testManagementSlice.reducer,
    navigation: navigationSlice.reducer,
    notificationManagement: notificationManagementSlice.reducer,
    adminPanel: adminPanelSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
