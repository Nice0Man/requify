import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import requirementsReducer from './slices/requirementsSlice';
import projectsReducer from './slices/projectsSlice';
import notificationsReducer from './slices/notificationsSlice';
import dashboardReducer from './slices/dashboardSlice';
import releasesReducer from './slices/releasesSlice';
import testingReducer from './slices/testingSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    requirements: requirementsReducer,
    projects: projectsReducer,
    notifications: notificationsReducer,
    dashboard: dashboardReducer,
    releases: releasesReducer,
    testing: testingReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 