import React, { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { apiClient } from '@/shared/api/client';

export const ApiStatusIndicator: React.FC = () => {
  const [isApiAvailable, setIsApiAvailable] = useState<boolean | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Health check endpoint is at root level, not under /api/v1
        const healthClient = new (await import('@/shared/api/client')).ApiClient('');
        await healthClient.get('/health');
        setIsApiAvailable(true);
      } catch (error) {
        setIsApiAvailable(false);
        setShowWarning(true);
        console.log('API Status: Backend unavailable, using demo mode');
      }
    };

    checkApiStatus();
  }, []);

  if (isApiAvailable || import.meta.env.PROD) {
    return null;
  }

  return (
    <Snackbar
      open={showWarning}
      autoHideDuration={6000}
      onClose={() => setShowWarning(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setShowWarning(false)}
        severity="info"
        variant="filled"
        sx={{ mt: 8 }}
      >
        🚧 Development mode: API unavailable, using demo data
      </Alert>
    </Snackbar>
  );
};