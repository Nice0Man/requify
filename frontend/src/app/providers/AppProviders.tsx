import React, { Suspense, memo } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../store";
import { ThemeProvider } from "./ThemeProvider";
import { TanStackQueryProvider } from "./TanStackQueryProvider";
import { Auth0Provider } from "./Auth0Provider";
import { CircularProgress, Box } from "@mui/material";
import { PerformanceOptimizedProviders } from "@/shared/contexts/PerformanceContext";

// Optimized fallback component with memoization
const GlobalSuspenseFallback = memo(() => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bgcolor="#f5f5f5"
  >
    <CircularProgress size={60} />
  </Box>
));

GlobalSuspenseFallback.displayName = 'GlobalSuspenseFallback';

interface AppProvidersProps {
  children: React.ReactNode;
}

// Memoized App Providers for optimal performance
export const AppProviders: React.FC<AppProvidersProps> = memo(({ children }) => {
  return (
    <Suspense fallback={<GlobalSuspenseFallback />}>
      <Provider store={store}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <TanStackQueryProvider>
            <Auth0Provider>
              <PerformanceOptimizedProviders>
                <ThemeProvider>{children}</ThemeProvider>
              </PerformanceOptimizedProviders>
            </Auth0Provider>
          </TanStackQueryProvider>
        </BrowserRouter>
      </Provider>
    </Suspense>
  );
});

AppProviders.displayName = 'AppProviders';
