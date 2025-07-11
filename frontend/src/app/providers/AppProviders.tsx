import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../store";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./QueryProvider";
import { Auth0Provider } from "./Auth0Provider";
import { CircularProgress, Box } from "@mui/material";

// Глобальный fallback для Suspense
const GlobalSuspenseFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bgcolor="#f5f5f5"
  >
    <CircularProgress size={60} />
  </Box>
);

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <Suspense fallback={<GlobalSuspenseFallback />}>
      <Provider store={store}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <QueryProvider>
            <Auth0Provider>
              <ThemeProvider>{children}</ThemeProvider>
            </Auth0Provider>
          </QueryProvider>
        </BrowserRouter>
      </Provider>
    </Suspense>
  );
};
