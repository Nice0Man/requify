import React, { Suspense, memo, useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../store";
import { ThemeProvider } from "./ThemeProvider";
import { TanStackQueryProvider } from "./TanStackQueryProvider";
import { Auth0Provider } from "./Auth0Provider";
import { PermissionsProvider } from "./PermissionsProvider";
import { CircularProgress, Box } from "@mui/material";
import { PerformanceProvider } from "@/shared/contexts/PerformanceContext";
import { useCurrentUser } from "@/features/auth/hooks/useAuthQuery";
import type { User } from "@/entities/user/model/types";

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

GlobalSuspenseFallback.displayName = "GlobalSuspenseFallback";

// =============================================================================
// Компонент-мост для интеграции Auth и Permissions
// =============================================================================

/**
 * Промежуточный компонент для передачи данных пользователя
 * из Auth в PermissionsProvider
 */
const PermissionsBridge: React.FC<{ children: React.ReactNode }> = memo(
  ({ children }) => {
    const { data: userProfile, isLoading, error } = useCurrentUser();

    // Конвертируем UserProfile в User для PermissionsProvider (мемоизированно)
    const user: User | null = useMemo(() => {
      if (!userProfile) return null;

      return {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        full_name: userProfile.full_name,
        role: userProfile.role,
        avatar_url: userProfile.avatar_url,
        is_active: userProfile.is_active,
        email_verified: userProfile.email_verified,
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at,
        last_login_at: userProfile.last_login_at,
      };
    }, [userProfile]);

    return (
      <PermissionsProvider
        user={user}
        isLoading={isLoading}
        error={error?.message || null}
      >
        {children}
      </PermissionsProvider>
    );
  }
);

PermissionsBridge.displayName = "PermissionsBridge";

interface AppProvidersProps {
  children: React.ReactNode;
}

// Memoized App Providers for optimal performance
export const AppProviders: React.FC<AppProvidersProps> = memo(
  ({ children }) => {
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
                <PermissionsBridge>
                  <PerformanceProvider>
                    <ThemeProvider>{children}</ThemeProvider>
                  </PerformanceProvider>
                </PermissionsBridge>
              </Auth0Provider>
            </TanStackQueryProvider>
          </BrowserRouter>
        </Provider>
      </Suspense>
    );
  }
);

AppProviders.displayName = "AppProviders";
