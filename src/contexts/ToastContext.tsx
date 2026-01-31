import { useState, useCallback, ReactNode } from 'react';
import { ToastContainer, ToastData, ToastType } from '../components/ui/Toast';
import { ToastContext } from './toast-context';

const MAX_TOASTS = 3;

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastData = { id, type, message };

    setToasts((prev) => {
      // Remove oldest if we're at max capacity
      const updated = prev.length >= MAX_TOASTS ? prev.slice(1) : prev;
      return [...updated, newToast];
    });
  }, []);

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
