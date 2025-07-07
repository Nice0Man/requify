import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Snackbar as MuiSnackbar, 
  Alert, 
  AlertColor, 
  Slide, 
  SlideProps 
} from '@mui/material';

interface SnackbarMessage {
  id: string;
  message: string;
  severity?: AlertColor;
  duration?: number;
  action?: React.ReactNode;
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

interface SnackbarProviderProps {
  children: React.ReactNode;
  maxSnack?: number;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

/**
 * SnackbarProvider - провайдер для управления уведомлениями
 * Предоставляет контекст для показа снекбаров в любом месте приложения
 */
export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
  maxSnack = 3,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
}) => {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);

  const showSnackbar = useCallback((
    message: string, 
    severity: AlertColor = 'info',
    duration: number = 6000
  ) => {
    const id = Date.now().toString();
    const newSnackbar: SnackbarMessage = {
      id,
      message,
      severity,
      duration,
    };

    setSnackbars(prev => {
      const updatedSnackbars = [...prev, newSnackbar];
      // Ограничиваем количество одновременных снекбаров
      if (updatedSnackbars.length > maxSnack) {
        return updatedSnackbars.slice(-maxSnack);
      }
      return updatedSnackbars;
    });

    // Автоматическое удаление через duration
    if (duration > 0) {
      setTimeout(() => {
        setSnackbars(prev => prev.filter(snack => snack.id !== id));
      }, duration);
    }
  }, [maxSnack]);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'success', duration);
  }, [showSnackbar]);

  const showError = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'error', duration);
  }, [showSnackbar]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'warning', duration);
  }, [showSnackbar]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'info', duration);
  }, [showSnackbar]);

  const handleClose = useCallback((id: string) => {
    setSnackbars(prev => prev.filter(snack => snack.id !== id));
  }, []);

  const contextValue: SnackbarContextType = {
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      {snackbars.map((snackbar, index) => (
        <MuiSnackbar
          key={snackbar.id}
          open={true}
          onClose={() => handleClose(snackbar.id)}
          TransitionComponent={SlideTransition}
          anchorOrigin={{
            ...anchorOrigin,
            vertical: anchorOrigin.vertical === 'bottom' ? 'bottom' : 'top',
          }}
          sx={{
            bottom: anchorOrigin.vertical === 'bottom' 
              ? `${16 + (index * 60)}px !important` 
              : undefined,
            top: anchorOrigin.vertical === 'top' 
              ? `${16 + (index * 60)}px !important` 
              : undefined,
          }}
        >
          <Alert
            onClose={() => handleClose(snackbar.id)}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </MuiSnackbar>
      ))}
    </SnackbarContext.Provider>
  );
};

/**
 * useSnackbar - хук для использования снекбаров
 * Предоставляет методы для показа уведомлений
 */
export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}; 