import { useState, useCallback } from 'react';

export interface UseDialogOptions<T = any> {
  initialData?: T;
  onConfirm?: (data?: T) => void | Promise<void>;
  onCancel?: () => void;
}

export interface UseDialogReturn<T = any> {
  isOpen: boolean;
  data: T | null;
  loading: boolean;
  open: (data?: T) => void;
  close: () => void;
  confirm: (data?: T) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export function useDialog<T = any>({
  initialData,
  onConfirm,
  onCancel,
}: UseDialogOptions<T> = {}): UseDialogReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState(false);

  const open = useCallback((newData?: T) => {
    setData(newData || initialData || null);
    setIsOpen(true);
  }, [initialData]);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    setLoading(false);
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const confirm = useCallback(async (confirmData?: T) => {
    if (onConfirm) {
      setLoading(true);
      try {
        await onConfirm(confirmData || data || undefined);
        close();
      } catch (error) {
        setLoading(false);
        throw error;
      }
    } else {
      close();
    }
  }, [data, onConfirm, close]);

  return {
    isOpen,
    data,
    loading,
    open,
    close,
    confirm,
    setLoading,
  };
} 