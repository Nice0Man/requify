import { configureStore } from "@reduxjs/toolkit";
import { routerSlice } from "./slices/routerSlice";
import { authSlice } from "@/features/auth/model/authSlice";
import { dashboardSlice } from "@/features/dashboard/model/dashboardSlice";

export const store = configureStore({
  reducer: {
    router: routerSlice.reducer,
    auth: authSlice.reducer,
    dashboard: dashboardSlice.reducer,
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
