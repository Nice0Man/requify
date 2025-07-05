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
      showSnackbar(message, 'success', options?.autoHideDuration);
    },
    error: (message: string, options?: ToastOptions) => {
      showSnackbar(message, 'error', options?.autoHideDuration);
    },
    warning: (message: string, options?: ToastOptions) => {
      showSnackbar(message, 'warning', options?.autoHideDuration);
    },
    info: (message: string, options?: ToastOptions) => {
      showSnackbar(message, 'info', options?.autoHideDuration);
    },
    show: (message: string, options?: ToastOptions) => {
      showSnackbar(message, options?.variant || 'info', options?.autoHideDuration);
    }
  };

  return toast;
};

// Export для совместимости с существующим кодом
export const toast = {
  success: (_message: string) => {
    console.warn('toast.success called outside of component. Use useToast hook instead.');
  },
  error: (_message: string) => {
    console.warn('toast.error called outside of component. Use useToast hook instead.');
  },
  warning: (_message: string) => {
    console.warn('toast.warning called outside of component. Use useToast hook instead.');
  },
  info: (_message: string) => {
    console.warn('toast.info called outside of component. Use useToast hook instead.');
  },
}; 