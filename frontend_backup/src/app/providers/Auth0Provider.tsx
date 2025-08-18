import React from 'react';
import { Auth0Provider as Auth0ProviderSDK } from '@auth0/auth0-react';
import { auth0Config, isAuth0Configured, shouldUseAuth0 } from '@/app/config/auth0.config';
import { BasicOAuth2Provider } from './BasicOAuth2Provider';
import { Box, Alert, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Auth0ProviderProps {
  children: React.ReactNode;
}

// Компонент для случая когда Auth0 не настроен
const Auth0NotConfigured: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [showDemo, setShowDemo] = React.useState(false);
  
  if (showDemo) {
    return <>{children}</>;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      p={3}
      bgcolor="#f5f5f5"
    >
      <Alert severity="warning" sx={{ mb: 3, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
          {t('auth0.notConfigured', 'Auth0 включен, но не настроен')}
        </Typography>
        <Typography variant="body2" paragraph>
          {t('auth0.notConfiguredDescription', 'Для работы Auth0 настройте переменные окружения или переключитесь на базовый OAuth2')}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setShowDemo(true)}
          sx={{ mt: 2 }}
        >
          {t('auth0.continueWithoutAuth', 'Продолжить без настройки Auth0')}
        </Button>
      </Alert>
    </Box>
  );
};

export const Auth0Provider: React.FC<Auth0ProviderProps> = ({ children }) => {
  const useAuth0 = shouldUseAuth0();
  const configured = isAuth0Configured();
  
  // Если Auth0 отключен, используем базовый OAuth2
  if (!useAuth0) {
    return <BasicOAuth2Provider>{children}</BasicOAuth2Provider>;
  }
  
  // Если Auth0 включен, но не настроен, показываем предупреждение
  if (!configured) {
    return <Auth0NotConfigured>{children}</Auth0NotConfigured>;
  }

  // Используем настоящий Auth0
  return (
    <Auth0ProviderSDK
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
        scope: auth0Config.scope,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0ProviderSDK>
  );
};