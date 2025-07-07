import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { OAuth2Provider } from './OAuth2Provider';
import { CircularProgress, Box } from '@mui/material';

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
        <BrowserRouter>
          <QueryProvider>
            <OAuth2Provider
              onAuthError={(error) => {
                console.error('OAuth2 error:', error);
                // Можно добавить глобальную обработку ошибок аутентификации
              }}
              onTokenRefreshed={() => {
                console.log('Token refreshed successfully');
                // Можно добавить логику при успешном обновлении токена
              }}
            >
              <AuthProvider>
                <ThemeProvider>
                  {children}
                </ThemeProvider>
              </AuthProvider>
            </OAuth2Provider>
          </QueryProvider>
        </BrowserRouter>
      </Provider>
    </Suspense>
  );
};
