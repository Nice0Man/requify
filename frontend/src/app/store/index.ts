import { configureStore } from '@reduxjs/toolkit';
import { dashboardSlice } from '@/features/dashboard';
import { projectManagementSlice } from '@/features/project-management';
import { requirementManagementSlice } from '@/features/requirement-management';
import { releaseManagementSlice } from '@/features/release-management';
import { testManagementSlice } from '@/features/test-management';
import { navigationSlice } from '@/features/navigation';
import { notificationManagementSlice } from '@/features/notification-management';
import { adminPanelSlice } from '@/features/admin-panel';

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
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
