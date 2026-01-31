import { createContext } from 'react';
import type { ToastType } from '../components/ui/Toast';

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);
