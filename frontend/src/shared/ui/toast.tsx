import { useSnackbar } from './Snackbar';

export interface ToastOptions {
  variant?: 'success' | 'error' | 'warning' | 'info';
  autoHideDuration?: number;
  action?: React.ReactNode;
}

// Hook для использования toast уведомлений
export const useToast = () => {
  const { showSnackbar } = useSnackbar();

  const toast = {
    success: (message: string, options?: ToastOptions) => {
      showSnackbar(message, { severity: 'success', ...options });
    },
    error: (message: string, options?: ToastOptions) => {
      showSnackbar(message, { severity: 'error', ...options });
    },
    warning: (message: string, options?: ToastOptions) => {
      showSnackbar(message, { severity: 'warning', ...options });
    },
    info: (message: string, options?: ToastOptions) => {
      showSnackbar(message, { severity: 'info', ...options });
    },
    show: (message: string, options?: ToastOptions) => {
      showSnackbar(message, options);
    }
  };

  return toast;
};

// Export для совместимости с существующим кодом
export const toast = {
  success: (message: string) => {
    console.warn('toast.success called outside of component. Use useToast hook instead.');
  },
  error: (message: string) => {
    console.warn('toast.error called outside of component. Use useToast hook instead.');
  },
  warning: (message: string) => {
    console.warn('toast.warning called outside of component. Use useToast hook instead.');
  },
  info: (message: string) => {
    console.warn('toast.info called outside of component. Use useToast hook instead.');
  },
}; 